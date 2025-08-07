// Auto-trigger test file for AgentWatch testing
// This file should automatically trigger the pr-summary agent
// because we have a watcher configured for test-files/*.js

function testAutoTrigger() {
  console.log('Testing AgentWatch auto-trigger behavior');
  console.log('Expected: pr-summary agent should trigger automatically');
  return {
    phase: 'auto-trigger',
    expectedAgent: 'pr-summary',
    timestamp: new Date().toISOString()
  };
}

module.exports = { testAutoTrigger };