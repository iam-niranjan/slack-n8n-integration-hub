# Slack Bot N8N Integration Hub

A Slack Bot Socket App that integrates with N8N for automation workflows. This bot provides two main features:
1. **Data Input Field**: Submit data directly to N8N workflows
2. **Approval/Rejection Buttons**: Send approval decisions to N8N for workflow automation

## Features

- 🚀 **Socket Mode**: Real-time communication with Slack
- 📝 **Data Submission**: Input field for sending custom data to N8N
- ✅ **Approval Workflow**: Approve/Reject buttons for decision-based automation
- 🔗 **Webhook Integration**: Seamless integration with N8N workflows
- 🔐 **Basic Authentication**: Optional HTTP Basic Auth for secure webhook communication
- 🛡️ **Error Handling**: Robust error handling and user feedback

## 🎥 Demo Video

Watch the Slack `/automation` command in action:

[![Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

*The demo shows how users can interact with the bot using the `/automation` slash command, submit data, and use approval/rejection buttons.*

## Prerequisites

- Node.js (v14 or higher)
- A Slack workspace where you can install apps
- N8N instance (cloud or self-hosted)
- Basic knowledge of Slack app configuration

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd slack-bot-n8n-integration
npm install
```

### 2. Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps) and click "Create New App"
2. Choose "From scratch"
3. Name your app (e.g., "N8N Automation Bot") and select your workspace
4. Click "Create App"

### 3. Configure Slack App Settings

#### OAuth & Permissions
1. Go to "OAuth & Permissions" in the sidebar
2. Add the following Bot Token Scopes:
   - `chat:write`
   - `commands`
   - `im:write`
   - `users:read`
3. Install the app to your workspace
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

#### Socket Mode
1. Go to "Socket Mode" in the sidebar
2. Enable Socket Mode
3. Generate an App-Level Token with `connections:write` scope
4. Copy the App-Level Token (starts with `xapp-`)

#### Slash Commands
1. Go to "Slash Commands" in the sidebar
2. Click "Create New Command"
3. Set the following:
   - **Command**: `/automation`
   - **Request URL**: Not needed for Socket Mode
   - **Short Description**: "Trigger N8N automation workflows"
   - **Usage Hint**: "Use this command to submit data or approve/reject workflows"

#### Interactivity & Shortcuts
1. Go to "Interactivity & Shortcuts"
2. Turn on Interactivity
3. Request URL is not needed for Socket Mode

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
   SLACK_APP_TOKEN=xapp-your-actual-app-token
   N8N_DATA_WEBHOOK_URL=https://your-n8n-instance.com/webhook/data-submission
   N8N_APPROVAL_WEBHOOK_URL=https://your-n8n-instance.com/webhook/approval-action
   
   # Optional: N8N Webhook Authentication
   N8N_AUTH_USER=your-webhook-username
   N8N_AUTH_PASSWORD=your-webhook-password
   
   PORT=3000
   ```

### 5. Set Up N8N Webhooks

#### Data Submission Webhook
1. Create a new workflow in N8N
2. Add a "Webhook" trigger node
3. Set the HTTP Method to "POST"
4. Copy the webhook URL and add it to your `.env` file as `N8N_DATA_WEBHOOK_URL`

#### Approval Webhook
1. Create another workflow in N8N (or add to existing)
2. Add a "Webhook" trigger node
3. Set the HTTP Method to "POST"
4. Copy the webhook URL and add it to your `.env` file as `N8N_APPROVAL_WEBHOOK_URL`

#### Optional: Webhook Authentication
For enhanced security, you can enable HTTP Basic Authentication on your N8N webhooks:

1. **In N8N Webhook Settings**:
   - Open your webhook trigger node
   - Go to the "Authentication" section
   - Select "Basic Auth"
   - Set a username and password

2. **In Your Bot Configuration**:
   - Add the same credentials to your `.env` file:
     ```env
     N8N_AUTH_USER=your-webhook-username
     N8N_AUTH_PASSWORD=your-webhook-password
     ```
   - The bot will automatically include these credentials in all webhook requests

3. **Security Benefits**:
   - Prevents unauthorized access to your N8N webhooks
   - Ensures only your Slack bot can trigger the workflows
   - Adds an extra layer of protection for sensitive automation processes

**Note**: If you don't set these authentication variables, the bot will work normally without authentication (backward compatible).

### 6. Run the Bot

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Usage

### Using the Bot in Slack

1. In any Slack channel or DM, type `/automation`
2. A modal will appear with two options:

#### Option 1: Data Submission
- Fill in the text area with your data
- Click "Submit Data"
- The data will be sent to your N8N data webhook

#### Option 2: Approval Workflow
- Click either "✅ Approve" or "❌ Reject"
- The decision will be sent to your N8N approval webhook

### Webhook Payload Structure

#### Data Submission Payload
```json
{
  "type": "data_submission",
  "data": "User input data here",
  "user": {
    "id": "U1234567890",
    "name": "username"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "slack_bot"
}
```

#### Approval Payload
```json
{
  "type": "approval_action",
  "action": "approve", // or "reject"
  "user": {
    "id": "U1234567890",
    "name": "username"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "slack_bot"
}
```

## N8N Workflow Examples

### Data Processing Workflow
1. **Webhook Trigger**: Receives data from Slack
2. **Function Node**: Process the received data
3. **HTTP Request**: Send processed data to external API
4. **Slack Node**: Send confirmation back to Slack (optional)

### Approval Workflow
1. **Webhook Trigger**: Receives approval/rejection
2. **IF Node**: Check if action is "approve" or "reject"
3. **Different paths**: Execute different actions based on decision
4. **Email/Notification**: Notify relevant parties

## Troubleshooting

### Common Issues

1. **Bot not responding to `/automation` command**
   - Check if the slash command is properly configured
   - Verify Socket Mode is enabled
   - Ensure the bot is installed in your workspace

2. **"N8N webhook URL not configured" error**
   - Check your `.env` file has the correct webhook URLs
   - Verify the N8N webhooks are active and accessible

3. **Socket connection issues**
   - Verify your `SLACK_APP_TOKEN` is correct
   - Check if your app has the `connections:write` scope

4. **Authentication errors (401 Unauthorized)**
   - Verify your `N8N_AUTH_USER` and `N8N_AUTH_PASSWORD` match the N8N webhook settings
   - Check if Basic Auth is properly configured in your N8N webhook trigger node
   - Ensure there are no extra spaces in your credentials
   - If not using authentication, remove or leave empty the auth environment variables

### Logs
The bot logs important events to the console. Check the terminal output for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this code for your own projects!

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the Slack API documentation
3. Check N8N webhook configuration
4. Open an issue in this repository

---

**Happy Automating! 🚀**
