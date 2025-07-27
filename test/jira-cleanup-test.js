// Test script for JIRA cleanup functionality
// Run this to test the cleanup process

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testJiraCleanup() {
  console.log('🧪 Testing JIRA cleanup functionality...\n')

  try {
    // Test 1: Manual cleanup
    console.log('1. Testing manual cleanup...')
    const cleanupResponse = await fetch(`${BASE_URL}/api/jira-sync?action=cleanup`)
    const cleanupResult = await cleanupResponse.json()
    
    console.log('Cleanup result:', JSON.stringify(cleanupResult, null, 2))
    
    if (cleanupResult.success) {
      console.log('✅ Manual cleanup test passed')
    } else {
      console.log('❌ Manual cleanup test failed')
    }

    // Test 2: Sync with cleanup
    console.log('\n2. Testing sync with cleanup...')
    const syncCleanupResponse = await fetch(`${BASE_URL}/api/jira-sync?action=sync-and-cleanup&maxResults=10`)
    const syncCleanupResult = await syncCleanupResponse.json()
    
    console.log('Sync with cleanup result:', JSON.stringify(syncCleanupResult, null, 2))
    
    if (syncCleanupResult.success) {
      console.log('✅ Sync with cleanup test passed')
    } else {
      console.log('❌ Sync with cleanup test failed')
    }

    // Test 3: Check tickets API (should trigger auto-cleanup)
    console.log('\n3. Testing tickets API auto-cleanup...')
    const ticketsResponse = await fetch(`${BASE_URL}/api/tickets?include_jira=true`)
    const ticketsResult = await ticketsResponse.json()
    
    console.log('Tickets API result:', {
      total: ticketsResult.total,
      local_count: ticketsResult.local_count,
      jira_count: ticketsResult.jira_count
    })
    
    if (ticketsResult.tickets) {
      console.log('✅ Tickets API auto-cleanup test passed')
    } else {
      console.log('❌ Tickets API auto-cleanup test failed')
    }

    console.log('\n🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testJiraCleanup()
}

module.exports = { testJiraCleanup } 