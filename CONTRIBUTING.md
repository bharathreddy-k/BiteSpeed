# Contributing to Bitespeed Identity Reconciliation

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation.git
   cd bitespeed-identity-reconciliation
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/bitespeed-identity-reconciliation.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

6. **Run migrations**
   ```bash
   npm run migrate
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

## 💻 Development Workflow

### Creating a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-soft-delete`
- `fix/email-validation-bug`
- `docs/update-api-examples`

### Making Changes

1. Write your code
2. Test your changes thoroughly
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Run tests: `npm test`

## 📝 Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type unless absolutely necessary
- Use async/await instead of raw promises
- Handle errors appropriately

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### File Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
└── types/           # TypeScript types
```

### Naming Conventions

- **Files**: camelCase for files (e.g., `identityService.ts`)
- **Classes**: PascalCase (e.g., `IdentityService`)
- **Functions**: camelCase (e.g., `findContact`)
- **Variables**: camelCase (e.g., `primaryContact`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces**: PascalCase (e.g., `Contact`)

### Code Documentation

Add JSDoc comments for:
- All public functions
- Complex logic
- Non-obvious code

Example:
```typescript
/**
 * Find all contacts linked to a primary contact
 * @param primaryId - The ID of the primary contact
 * @returns Array of linked contacts
 */
static async findLinkedContacts(primaryId: number): Promise<Contact[]> {
  // Implementation
}
```

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat(api): add email validation middleware"
git commit -m "fix(database): resolve connection pool leak"
git commit -m "docs(readme): update installation instructions"

# Bad commit messages (avoid these)
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "changes"
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Make small, frequent commits rather than large ones

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Test your changes**
   - Test manually with Postman or curl
   - Ensure all existing functionality still works
   - Add tests for new features

### Submitting a Pull Request

1. **Push your changes**
   ```bash
   git push origin your-feature-branch
   ```

2. **Create Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

- At least one maintainer must approve the PR
- All CI checks must pass
- Address all review comments
- Keep the PR updated with main branch

## 🐛 Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Check if you're using the latest version
- Try to reproduce the bug

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11]
- Node.js version: [e.g., 18.17.0]
- Database: [e.g., PostgreSQL 14.5]

**Additional Context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other solutions you've thought about

**Additional Context**
Any other relevant information
```

## 🧪 Testing

### Writing Tests

- Write tests for all new features
- Update tests when changing existing features
- Aim for good test coverage
- Use descriptive test names

Example:
```typescript
describe('IdentityService', () => {
  describe('identify', () => {
    it('should create a new primary contact for first-time customer', async () => {
      // Test implementation
    });

    it('should link secondary contact when matching info found', async () => {
      // Test implementation
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📖 Documentation

### What to Document

- New features and APIs
- Configuration options
- Setup instructions
- Examples and use cases

### Where to Document

- Code comments for implementation details
- README.md for general information
- DOCS.md for detailed API documentation
- Inline code documentation using JSDoc

## ❓ Questions?

- Create an issue with the "question" label
- Reach out to maintainers

## 🎉 Thank You!

Your contributions make this project better for everyone!

---

**Happy Coding! 🚀**
