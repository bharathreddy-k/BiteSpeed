# Docker Deployment Guide

This guide explains how to deploy the Bitespeed Identity Reconciliation service using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (for multi-container setup)

## Quick Start with Docker Compose

The easiest way to run the application with Docker:

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ destroys data)
docker-compose down -v
```

The application will be available at `http://localhost:3000`

## Building the Docker Image

### Build from scratch

```bash
# Build the image
docker build -t bitespeed-identity:latest .

# View built images
docker images | grep bitespeed
```

### Multi-stage build

Our Dockerfile uses multi-stage builds to:
- Reduce final image size
- Separate build and runtime dependencies
- Improve security by running as non-root user

## Running with Docker (Manual Setup)

### 1. Create a network

```bash
docker network create bitespeed-network
```

### 2. Start PostgreSQL

```bash
docker run -d \
  --name bitespeed-db \
  --network bitespeed-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bitespeed_db \
  -p 5432:5432 \
  -v bitespeed-data:/var/lib/postgresql/data \
  postgres:14-alpine
```

### 3. Start the application

```bash
docker run -d \
  --name bitespeed-app \
  --network bitespeed-network \
  -e NODE_ENV=production \
  -e DB_HOST=bitespeed-db \
  -e DB_PORT=5432 \
  -e DB_NAME=bitespeed_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -p 3000:3000 \
  bitespeed-identity:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | production |
| PORT | Application port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | bitespeed_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| DATABASE_URL | Full connection string (alternative) | - |

## Docker Compose Configuration

### Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: builder  # Use builder stage for development
    volumes:
      - ./src:/app/src  # Mount source code
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev
```

Run with: `docker-compose -f docker-compose.dev.yml up`

### Production

Use the default `docker-compose.yml` (already optimized for production)

## Health Checks

The Docker container includes built-in health checks:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' bitespeed-app

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' bitespeed-app
```

## Monitoring

### View logs

```bash
# Follow logs
docker logs -f bitespeed-app

# View last 100 lines
docker logs --tail 100 bitespeed-app

# View logs with timestamps
docker logs -t bitespeed-app
```

### Resource usage

```bash
# Real-time stats
docker stats bitespeed-app

# Detailed container info
docker inspect bitespeed-app
```

## Database Management

### Backup database

```bash
docker exec bitespeed-db pg_dump -U postgres bitespeed_db > backup.sql
```

### Restore database

```bash
docker exec -i bitespeed-db psql -U postgres bitespeed_db < backup.sql
```

### Access database shell

```bash
docker exec -it bitespeed-db psql -U postgres -d bitespeed_db
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs bitespeed-app

# Check if database is ready
docker exec bitespeed-db pg_isready
```

### Database connection issues

```bash
# Verify network
docker network inspect bitespeed-network

# Test connection from app container
docker exec bitespeed-app nc -zv bitespeed-db 5432
```

### Reset everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker rmi bitespeed-identity:latest

# Start fresh
docker-compose up -d
```

## Production Considerations

### Security

1. **Use secrets for sensitive data**
   ```bash
   docker secret create db_password ./db_password.txt
   ```

2. **Run as non-root user** (already configured in Dockerfile)

3. **Use specific versions** instead of `latest` tag

4. **Scan images for vulnerabilities**
   ```bash
   docker scan bitespeed-identity:latest
   ```

### Performance

1. **Resource limits**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '1.0'
             memory: 512M
           reservations:
             cpus: '0.5'
             memory: 256M
   ```

2. **Persistent volumes** for database data

3. **Health checks** for automatic recovery

### Scaling

```bash
# Scale application (requires load balancer)
docker-compose up -d --scale app=3
```

## CI/CD Integration

### Build in CI

```bash
docker build -t bitespeed-identity:$VERSION .
docker tag bitespeed-identity:$VERSION bitespeed-identity:latest
```

### Push to registry

```bash
docker login registry.example.com
docker tag bitespeed-identity:latest registry.example.com/bitespeed-identity:latest
docker push registry.example.com/bitespeed-identity:latest
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
