const axios = require('axios');
require('dotenv').config();

// Test script to verify N8N webhook connectivity
const testWebhooks = async () => {
  console.log('🧪 Testing N8N Webhook Connectivity\n');

  const N8N_DATA_WEBHOOK = process.env.N8N_DATA_WEBHOOK_URL;
  const N8N_APPROVAL_WEBHOOK = process.env.N8N_APPROVAL_WEBHOOK_URL;

  // Test data submission webhook
  if (N8N_DATA_WEBHOOK) {
    console.log('📤 Testing Data Submission Webhook...');
    try {
      const testDataPayload = {
        type: 'data_submission',
        data: 'Test data from webhook test script',
        user: {
          id: 'TEST_USER_ID',
          name: 'test_user'
        },
        timestamp: new Date().toISOString(),
        source: 'webhook_test'
      };

      const response = await axios.post(N8N_DATA_WEBHOOK, testDataPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Data webhook test successful!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ Data webhook test failed!');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data}`);
      } else if (error.request) {
        console.log('   Error: No response received (check URL and network)');
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  } else {
    console.log('⚠️  Data webhook URL not configured in .env file\n');
  }

  // Test approval webhook
  if (N8N_APPROVAL_WEBHOOK) {
    console.log('📤 Testing Approval Webhook...');
    try {
      const testApprovalPayload = {
        type: 'approval_action',
        action: 'approve',
        user: {
          id: 'TEST_USER_ID',
          name: 'test_user'
        },
        timestamp: new Date().toISOString(),
        source: 'webhook_test'
      };

      const response = await axios.post(N8N_APPROVAL_WEBHOOK, testApprovalPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Approval webhook test successful!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ Approval webhook test failed!');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data}`);
      } else if (error.request) {
        console.log('   Error: No response received (check URL and network)');
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  } else {
    console.log('⚠️  Approval webhook URL not configured in .env file\n');
  }

  console.log('🏁 Webhook testing completed!');
  console.log('\nIf tests failed, please check:');
  console.log('1. Your .env file has the correct webhook URLs');
  console.log('2. Your N8N workflows are active and accessible');
  console.log('3. Your network connection allows outbound HTTPS requests');
};

// Run the test
testWebhooks().catch(console.error);