// AgentWatch Test - Phase 3: Auto-Trigger
// This file SHOULD trigger the pr-summary agent automatically

function autoTrigger() {
  console.log('Phase 3: Testing auto-trigger with watcher configured');
  console.log('Watcher: pr-summary for test-files/*.js');
  return 'Agent should trigger automatically';
}

module.exports = { autoTrigger };