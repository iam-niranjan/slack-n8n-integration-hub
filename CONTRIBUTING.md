# Contributing to Slack Bot N8N Integration Hub

Thank you for your interest in contributing to this project! This guide will help you get started with contributing to the Slack Bot N8N Integration Hub.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- A Slack workspace for testing
- Access to an N8N instance

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/slack-bot-n8n-integration.git
   cd slack-bot-n8n-integration
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure your `.env` file with your Slack and N8N credentials

6. Test the setup:
   ```bash
   npm run test-webhooks
   ```

## Project Structure

```
slack-bot-n8n-integration/
├── app.js                      # Main application file
├── package.json                # Dependencies and scripts
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
├── CONTRIBUTING.md            # This file
├── test-webhook.js            # Webhook testing utility
└── n8n-workflow-examples.json # Example N8N workflows
```

### Key Components

- **app.js**: Contains the main Slack Bot logic including:
  - Slash command handlers
  - Modal interactions
  - Button click handlers
  - Webhook integrations with N8N

- **test-webhook.js**: Utility script for testing N8N webhook connectivity

- **n8n-workflow-examples.json**: Example N8N workflow configurations

## Code Style

### JavaScript Style Guidelines

- Use ES6+ features where appropriate
- Use `const` and `let` instead of `var`
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Example Code Style

```javascript
// Good
const processUserData = async (userData) => {
  try {
    const processedData = {
      ...userData,
      timestamp: new Date().toISOString(),
      processed: true
    };
    
    return await sendToN8N(processedData);
  } catch (error) {
    console.error('Error processing user data:', error);
    throw error;
  }
};

// Avoid
var processData = function(data) {
  // Complex logic without comments
  return data;
};
```

### Error Handling

- Always use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors with context
- Handle errors gracefully and provide user feedback

```javascript
try {
  await someAsyncOperation();
} catch (error) {
  console.error('Specific operation failed:', error);
  await client.chat.postMessage({
    channel: userId,
    text: '❌ Something went wrong. Please try again.'
  });
}
```

## Testing

### Manual Testing

1. **Webhook Testing**:
   ```bash
   npm run test-webhooks
   ```

2. **Slack Bot Testing**:
   - Start the bot: `npm run dev`
   - Use `/automation` command in Slack
   - Test both data submission and approval workflows

3. **N8N Integration Testing**:
   - Verify webhooks receive correct payloads
   - Test workflow execution
   - Check error handling

### Testing Checklist

- [ ] Slash command responds correctly
- [ ] Modal opens and displays properly
- [ ] Data submission sends correct payload to N8N
- [ ] Approve/Reject buttons work correctly
- [ ] Error messages are user-friendly
- [ ] Webhook connectivity test passes
- [ ] Environment variables are properly validated

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the code style guidelines
   - Add comments where necessary
   - Test your changes thoroughly

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**:
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Add testing instructions

### Commit Message Guidelines

Use conventional commit format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Examples:
```
feat: add support for custom webhook headers
fix: handle network timeout errors gracefully
docs: update setup instructions for N8N integration
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Manual testing completed
- [ ] Webhook tests pass
- [ ] Slack integration works

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional information]
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Environment Information**:
   - Node.js version
   - Operating system
   - Slack workspace type (free/paid)
   - N8N version/hosting type

2. **Steps to Reproduce**:
   - Clear step-by-step instructions
   - Expected vs actual behavior
   - Error messages or logs

3. **Additional Context**:
   - Screenshots or videos
   - Configuration details (without sensitive data)
   - Related issues or discussions

### Feature Requests

For feature requests, please include:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: Your idea for implementing the feature
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## Development Tips

### Debugging

1. **Enable Debug Logging**:
   ```javascript
   console.log('Debug info:', { variable, context });
   ```

2. **Use Slack's Request URL for Testing**:
   - Temporarily switch from Socket Mode to Request URL
   - Use tools like ngrok for local testing

3. **N8N Workflow Debugging**:
   - Use the N8N workflow execution log
   - Add debug nodes to inspect data flow

### Common Pitfalls

1. **Socket Mode Configuration**: Ensure app-level tokens have correct scopes
2. **Webhook URLs**: Verify URLs are accessible and active
3. **Rate Limiting**: Be mindful of Slack API rate limits
4. **Error Handling**: Always provide user feedback for errors

## Getting Help

If you need help:

1. Check the [README.md](README.md) for setup instructions
2. Review existing issues and discussions
3. Join our community discussions
4. Reach out to maintainers

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to learn and build something useful together!

---

Thank you for contributing! 🚀