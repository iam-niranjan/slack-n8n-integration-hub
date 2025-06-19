const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Handle submit data button click
app.action('submit_data_action', async ({ ack, body, client }) => {
  await ack();

  try {
    // Extract the input data from the modal state
    const inputData = body.view.state.values.data_input.data_value.value;
    const userId = body.user.id;
    const userName = body.user.name;

    // Check if data was provided
    if (inputData && inputData.trim()) {
      // Prepare payload for N8N
      const payload = {
        type: 'data_submission',
        data: inputData,
        user: {
          id: userId,
          name: userName
        },
        timestamp: new Date().toISOString(),
        source: 'slack_bot'
      };

      // Send data to N8N webhook
      if (N8N_DATA_WEBHOOK) {
        await axios.post(N8N_DATA_WEBHOOK, payload, {
          headers: createAuthHeaders()
        });

        // Update the modal to show success
        await client.views.update({
          view_id: body.view.id,
          view: {
            type: 'modal',
            title: {
              type: 'plain_text',
              text: 'Data Submitted'
            },
            close: {
              type: 'plain_text',
              text: 'Close'
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `✅ *Your data has been successfully sent to N8N automation workflow!*\n\n*Data submitted:*\n\`\`\`${inputData}\`\`\``
                }
              }
            ]
          }
        });
      } else {
        await client.views.update({
          view_id: body.view.id,
          view: {
            type: 'modal',
            title: {
              type: 'plain_text',
              text: 'Configuration Error'
            },
            close: {
              type: 'plain_text',
              text: 'Close'
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '⚠️ N8N webhook URL not configured. Please check your environment variables.'
                }
              }
            ]
          }
        });
      }
    } else {
      // No data provided
      await client.views.update({
        view_id: body.view.id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'No Data Provided'
          },
          close: {
            type: 'plain_text',
            text: 'Close'
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '⚠️ No data was provided. Please enter some data before submitting.'
              }
            }
          ]
        }
      });
    }

  } catch (error) {
    console.error('Error processing data submission:', error);
    await client.views.update({
      view_id: body.view.id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Error'
        },
        close: {
          type: 'plain_text',
          text: 'Close'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❌ Error processing your request. Please try again.'
            }
          }
        ]
      }
    });
  }
});

// N8N webhook URLs (configure these in your .env file)
const N8N_DATA_WEBHOOK = process.env.N8N_DATA_WEBHOOK_URL;
const N8N_APPROVAL_WEBHOOK = process.env.N8N_APPROVAL_WEBHOOK_URL;

// N8N webhook authentication (optional)
const N8N_AUTH_USER = process.env.N8N_AUTH_USER;
const N8N_AUTH_PASSWORD = process.env.N8N_AUTH_PASSWORD;

// Helper function to create authentication headers
function createAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add basic authentication if credentials are provided
  if (N8N_AUTH_USER && N8N_AUTH_PASSWORD) {
    const credentials = Buffer.from(`${N8N_AUTH_USER}:${N8N_AUTH_PASSWORD}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }
  
  return headers;
}

// Slash command to trigger the bot
app.command('/automation', async ({ command, ack, body, client }) => {
  await ack();

  try {
    // Open a modal with input field and approval buttons
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'automation_modal',
        title: {
          type: 'plain_text',
          text: 'N8N Automation Request'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Submit data to N8N automation workflow*'
            }
          },
          {
            type: 'input',
            block_id: 'data_input',
            optional: true,
            element: {
              type: 'plain_text_input',
              action_id: 'data_value',
              placeholder: {
                type: 'plain_text',
                text: 'Enter your data here...'
              },
              multiline: true
            },
            label: {
              type: 'plain_text',
              text: 'Data Input (Optional)'
            }
          },
          {
            type: 'actions',
            block_id: 'submit_data_action',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Submit Data'
                },
                style: 'primary',
                action_id: 'submit_data_action',
                value: 'submit_data'
              }
            ]
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Approval workflow (Optional)*'
            }
          },
          {
            type: 'actions',
            block_id: 'approval_actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '✅ Approve'
                },
                style: 'primary',
                action_id: 'approve_action',
                value: 'approve'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '❌ Reject'
                },
                style: 'danger',
                action_id: 'reject_action',
                value: 'reject'
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// Alternative slash command for n8n-bot
app.command('/n8n-bot', async ({ command, ack, body, client }) => {
  await ack();

  try {
    // Open a modal with input field and approval buttons
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'automation_modal',
        title: {
          type: 'plain_text',
          text: 'N8N Automation Request'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Submit data to N8N automation workflow*'
            }
          },
          {
            type: 'input',
            block_id: 'data_input',
            optional: true,
            element: {
              type: 'plain_text_input',
              action_id: 'data_value',
              placeholder: {
                type: 'plain_text',
                text: 'Enter your data here...'
              },
              multiline: true
            },
            label: {
              type: 'plain_text',
              text: 'Data Input (Optional)'
            }
          },
          {
            type: 'actions',
            block_id: 'submit_data_action',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Submit Data'
                },
                style: 'primary',
                action_id: 'submit_data_action',
                value: 'submit_data'
              }
            ]
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Approval workflow (Optional)*'
            }
          },
          {
            type: 'actions',
            block_id: 'approval_actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '✅ Approve'
                },
                style: 'primary',
                action_id: 'approve_action',
                value: 'approve'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '❌ Reject'
                },
                style: 'danger',
                action_id: 'reject_action',
                value: 'reject'
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// Handle modal submission (data input)
app.view('automation_modal', async ({ ack, body, view, client }) => {
  await ack();

  try {
    // Extract the input data (optional)
    const inputData = view.state.values.data_input.data_value.value;
    const userId = body.user.id;
    const userName = body.user.name;

    // Check if data was provided
    if (inputData && inputData.trim()) {
      // Prepare payload for N8N
      const payload = {
        type: 'data_submission',
        data: inputData,
        user: {
          id: userId,
          name: userName
        },
        timestamp: new Date().toISOString(),
        source: 'slack_bot'
      };

      // Send data to N8N webhook
      if (N8N_DATA_WEBHOOK) {
        await axios.post(N8N_DATA_WEBHOOK, payload, {
          headers: createAuthHeaders()
        });

        // Send confirmation message
        await client.chat.postMessage({
          channel: userId,
          text: `✅ Your data has been successfully sent to N8N automation workflow!\n\n*Data submitted:*\n\`\`\`${inputData}\`\`\``
        });
      } else {
        await client.chat.postMessage({
          channel: userId,
          text: '⚠️ N8N webhook URL not configured. Please check your environment variables.'
        });
      }
    } else {
      // No data provided, just acknowledge
      await client.chat.postMessage({
        channel: userId,
        text: '✅ Modal submitted successfully! Use the approval buttons for workflow actions.'
      });
    }

  } catch (error) {
    console.error('Error processing modal submission:', error);
    await client.chat.postMessage({
      channel: body.user.id,
      text: '❌ Error processing your request. Please try again.'
    });
  }
});

// Handle approve button click
app.action('approve_action', async ({ ack, body, client }) => {
  await ack();

  try {
    const userId = body.user.id;
    const userName = body.user.name;

    // Prepare approval payload for N8N
    const payload = {
      type: 'approval_action',
      action: 'approve',
      user: {
        id: userId,
        name: userName
      },
      timestamp: new Date().toISOString(),
      source: 'slack_bot'
    };

    // Send approval to N8N webhook
    if (N8N_APPROVAL_WEBHOOK) {
      await axios.post(N8N_APPROVAL_WEBHOOK, payload, {
        headers: createAuthHeaders()
      });

      // Close the modal and send a message
      await client.views.update({
        view_id: body.view.id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'Action Complete'
          },
          close: {
            type: 'plain_text',
            text: 'Close'
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '✅ *Approval sent to N8N!*\n\nYour approval has been processed and sent to the automation workflow.'
              }
            }
          ]
        }
      });
    } else {
      await client.views.update({
        view_id: body.view.id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'Configuration Error'
          },
          close: {
            type: 'plain_text',
            text: 'Close'
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '⚠️ N8N approval webhook URL not configured. Please check your environment variables.'
              }
            }
          ]
        }
      });
    }

  } catch (error) {
    console.error('Error processing approval:', error);
    await client.views.update({
      view_id: body.view.id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Error'
        },
        close: {
          type: 'plain_text',
          text: 'Close'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❌ Error processing approval. Please try again.'
            }
          }
        ]
      }
    });
  }
});

// Handle reject button click
app.action('reject_action', async ({ ack, body, client }) => {
  await ack();

  try {
    const userId = body.user.id;
    const userName = body.user.name;

    // Prepare rejection payload for N8N
    const payload = {
      type: 'approval_action',
      action: 'reject',
      user: {
        id: userId,
        name: userName
      },
      timestamp: new Date().toISOString(),
      source: 'slack_bot'
    };

    // Send rejection to N8N webhook
    if (N8N_APPROVAL_WEBHOOK) {
      await axios.post(N8N_APPROVAL_WEBHOOK, payload, {
        headers: createAuthHeaders()
      });

      // Close the modal and send a message
      await client.views.update({
        view_id: body.view.id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'Action Complete'
          },
          close: {
            type: 'plain_text',
            text: 'Close'
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '❌ *Rejection sent to N8N!*\n\nYour rejection has been processed and sent to the automation workflow.'
              }
            }
          ]
        }
      });
    } else {
      await client.views.update({
        view_id: body.view.id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'Configuration Error'
          },
          close: {
            type: 'plain_text',
            text: 'Close'
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '⚠️ N8N approval webhook URL not configured. Please check your environment variables.'
              }
            }
          ]
        }
      });
    }

  } catch (error) {
    console.error('Error processing rejection:', error);
    await client.views.update({
      view_id: body.view.id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Error'
        },
        close: {
          type: 'plain_text',
          text: 'Close'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❌ Error processing rejection. Please try again.'
            }
          }
        ]
      }
    });
  }
});

// Error handling
app.error((error) => {
  console.error('Slack app error:', error);
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack Bot is running in Socket Mode!');
    console.log('Use the /automation command in Slack to interact with the bot');
  } catch (error) {
    console.error('Failed to start the app:', error);
  }
})();

module.exports = app;