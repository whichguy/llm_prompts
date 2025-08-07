// Baseline test file for AgentWatch testing
// This file is used to verify that no agents trigger when no watchers are configured

function testBaseline() {
  console.log('Testing AgentWatch baseline behavior');
  console.log('Expected: No agents should trigger');
  return {
    phase: 'baseline',
    expectedTriggers: 0,
    timestamp: new Date().toISOString()
  };
}

module.exports = { testBaseline };