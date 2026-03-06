import app from './app';
import { pool } from './config/database';
import { createContactsTable } from './config/migrate';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting Bitespeed Identity Reconciliation Service...');
    
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection established');

    // Run migrations
    await createContactsTable();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ Identify endpoint: http://localhost:${PORT}/identify`);
      console.log('\n📝 Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⚠ SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠ SIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
