const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test GreenPay integration
async function testGreenPayIntegration() {
  console.log('🧪 Testing GreenPay Integration...\n');

  try {
    // Test payment processing
    const paymentData = {
      amount: 100,
      paymentType: 'full',
      customerInfo: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890'
      }
    };

    console.log('📤 Sending payment request:', paymentData);

    const response = await fetch('http://localhost:3002/api/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    
    console.log('📥 Payment response:', result);
    
    if (result.success) {
      console.log('✅ Payment processed successfully!');
      console.log('💰 Payment ID:', result.paymentId);
    } else {
      console.log('❌ Payment failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test cron job status
async function testCronJobStatus() {
  console.log('\n🕐 Testing Cron Job Status...\n');

  try {
    const response = await fetch('http://localhost:3002/api/payments/cron/status');
    const result = await response.json();
    
    console.log('📊 Cron job status:', result);
    
    if (result.success) {
      console.log('✅ Cron jobs are running!');
      result.data.jobs.forEach(job => {
        console.log(`   - ${job.name}: ${job.running ? '🟢 Running' : '🔴 Stopped'}`);
      });
    }

  } catch (error) {
    console.error('❌ Cron status test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Backend Tests...\n');
  
  await testGreenPayIntegration();
  await testCronJobStatus();
  
  console.log('\n✨ Tests completed!');
}

// Check if we're running this script directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testGreenPayIntegration, testCronJobStatus };
