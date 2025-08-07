// AgentWatch Test - Phase 1: Baseline
// This file should NOT trigger any agents (no watchers configured)

function baseline() {
  console.log('Phase 1: Testing with no watchers');
  return 'No agents should trigger';
}

module.exports = { baseline };