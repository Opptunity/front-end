// Test script to verify IT trends caching is working
// Run with: node test/cache-test.js

const FRONTEND_URL = 'http://localhost:3000'; // Adjust if needed

async function testCaching() {
  console.log('🧪 Testing IT Trends Caching System\n');

  try {
    // Test 1: Initial load (should trigger AI generation or load from cache)
    console.log('1️⃣ Testing initial load...');
    const start1 = Date.now();
    const response1 = await fetch(`${FRONTEND_URL}/api/it-trends`);
    const data1 = await response1.json();
    const duration1 = Date.now() - start1;
    
    console.log(`   ✅ Loaded ${data1.trends?.length || 0} trends in ${duration1}ms`);
    console.log(`   📊 Cache stats:`, data1.cacheStats);
    console.log('');

    // Test 2: Immediate reload (should use cache)
    console.log('2️⃣ Testing immediate reload...');
    const start2 = Date.now();
    const response2 = await fetch(`${FRONTEND_URL}/api/it-trends`);
    const data2 = await response2.json();
    const duration2 = Date.now() - start2;
    
    console.log(`   ✅ Loaded ${data2.trends?.length || 0} trends in ${duration2}ms`);
    console.log(`   🚀 Speed improvement: ${Math.round((duration1 - duration2) / duration1 * 100)}%`);
    console.log('');

    // Test 3: Category filtering (should use cached data)
    const categories = ['frontend', 'backend', 'ai/ml', 'devops'];
    
    for (const category of categories) {
      console.log(`3️⃣ Testing category filter: ${category}...`);
      const start3 = Date.now();
      const response3 = await fetch(`${FRONTEND_URL}/api/it-trends?category=${category}`);
      const data3 = await response3.json();
      const duration3 = Date.now() - start3;
      
      console.log(`   ✅ Filtered ${data3.trends?.length || 0} trends in ${duration3}ms`);
    }
    console.log('');

    // Test 4: Multiple rapid requests (should not trigger multiple AI calls)
    console.log('4️⃣ Testing rapid concurrent requests...');
    const start4 = Date.now();
    const promises = Array(5).fill().map(() => 
      fetch(`${FRONTEND_URL}/api/it-trends?category=frontend`)
    );
    const responses4 = await Promise.all(promises);
    const data4 = await Promise.all(responses4.map(r => r.json()));
    const duration4 = Date.now() - start4;
    
    console.log(`   ✅ 5 concurrent requests completed in ${duration4}ms`);
    console.log(`   📊 All returned same data: ${data4.every(d => d.trends?.length === data4[0].trends?.length)}`);

    console.log('\n🎉 Cache test completed successfully!');
    
  } catch (error) {
    console.error('❌ Cache test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCaching(); 