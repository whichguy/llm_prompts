# AgentWatch Workflow Analysis

## Current Workflows

### 1. `agent-pr-summary.yml`
**Status**: ⚠️ OLD DESIGN - Needs Update
**Type**: Reusable workflow (workflow_call)
**Purpose**: Analyzes PR and generates summary report

**Issues**:
- Designed as a reusable workflow with `workflow_call` trigger
- No integration with AgentWatch system
- Missing GITHUB_TOKEN in github-script action
- Not being called by any other workflow currently

**Recommendation**: 
- Convert to be callable by AgentWatch system
- Add proper error handling
- Integrate with label management

### 2. `agentwatch-auto-trigger.yml`
**Status**: ❌ BROKEN - Not Triggering on PRs
**Type**: Auto-trigger on pull_request events
**Purpose**: Automatically run agents when PRs match watcher patterns

**Issues**:
- **CRITICAL**: Not triggering on pull_request events (GitHub Actions caching issue)
- Missing GITHUB_TOKEN initially (fixed but too late)
- Very long line (line 235) causing parsing issues (fixed)
- Limited error handling
- Agent execution is inline instead of calling separate workflows

**Recommendation**:
- Needs complete rewrite or replacement with V2
- Should call agent workflows instead of inline execution
- Add comprehensive error handling

### 3. `agentwatch-orchestrator.yml`
**Status**: ✅ WORKING
**Type**: Command processor (issue_comment trigger)
**Purpose**: Processes @agent-watch, @agent-unwatch, @agent-list commands

**Issues**:
- Command parsing doesn't handle shell-style quoting properly
- No validation of agent names
- Limited error messages

**Recommendation**:
- Add proper shell-style argument parsing
- Validate agent names against available agents
- Add @agent-help command
- Better error messages with examples

### 4. `agentwatch-pr-test.yml`
**Status**: ✅ WORKING
**Type**: Test workflow
**Purpose**: Simple test to verify PR triggers work

**Issues**: None - this is just for testing

## Missing Components

### 1. Individual Agent Workflows
Currently missing separate workflow files for each agent type:
- `agent-pr-summary.yml` exists but isn't integrated
- Need: `agent-code-review.yml`, `agent-security-scan.yml`, etc.

### 2. AgentWatch Auto Trigger V2
The V2 workflow with comprehensive error handling exists in test branch but not in main

### 3. Agent Registry
No central registry of available agents and their configurations

## Recommended Architecture

```
.github/
├── workflows/
│   ├── agentwatch-orchestrator.yml     # Command processor ✅
│   ├── agentwatch-auto-trigger-v2.yml  # Auto-trigger (new)
│   └── agents/                         # Agent implementations
│       ├── pr-summary.yml
│       ├── code-review.yml
│       └── security-scan.yml
└── agentwatch.yml                      # Watcher configuration ✅
```

## Design Issues to Address

### 1. Workflow Trigger Problem
**Issue**: `agentwatch-auto-trigger.yml` doesn't trigger on pull_request events
**Root Cause**: 
- GitHub Actions caching of broken workflow
- Missing GITHUB_TOKEN initially
- Syntax issues with long lines

**Solution**:
- Deploy `agentwatch-auto-trigger-v2.yml` to main
- Remove old `agentwatch-auto-trigger.yml`
- Ensure all workflows have proper token configuration

### 2. Agent Execution Model
**Current**: Inline execution in auto-trigger workflow
**Problem**: 
- Difficult to maintain
- No modularity
- Hard to add new agents

**Solution**:
- Each agent should be a separate reusable workflow
- Auto-trigger should dispatch to agent workflows
- Use workflow_dispatch or workflow_call

### 3. Command Parsing
**Issue**: Doesn't handle quotes properly in patterns
**Example**: `@agent-watch pr-summary "test-files/*.js"` creates pattern with quotes

**Solution**:
```javascript
// Add proper shell-style parsing
const parseCommand = (text) => {
  // Handle quoted strings properly
  const regex = /@agent-(\w+)\s+(\S+)(?:\s+(.*))?/;
  const match = text.match(regex);
  if (match && match[3]) {
    // Remove surrounding quotes if present
    match[3] = match[3].replace(/^["']|["']$/g, '');
  }
  return match;
};
```

### 4. Error Handling
**Current**: Limited error handling and logging
**Problem**: Silent failures, hard to debug

**Solution**:
- Add try-catch blocks around all async operations
- Log all errors with context
- Use `core.setFailed()` for critical errors
- Add status comments to PRs when errors occur

## Action Items

1. **Immediate**:
   - [ ] Deploy agentwatch-auto-trigger-v2.yml to main
   - [ ] Fix command parsing in orchestrator
   - [ ] Add GITHUB_TOKEN to all github-script actions

2. **Short-term**:
   - [ ] Convert agent-pr-summary.yml to work with AgentWatch
   - [ ] Create modular agent workflows
   - [ ] Add agent validation in orchestrator

3. **Long-term**:
   - [ ] Create agent registry system
   - [ ] Add more agent types
   - [ ] Implement agent configuration options
   - [ ] Add webhook support for external agents

## Test Results Summary

| Phase | Test | Result | Notes |
|-------|------|--------|-------|
| 1 | Baseline (no watchers) | ✅ PASSED | No agents triggered |
| 2 | Add watcher (@agent-watch) | ✅ PASSED | Watcher added successfully |
| 3 | Auto-trigger new PR | ❌ FAILED | Workflow doesn't trigger on PRs |
| 4 | Remove watcher (@agent-unwatch) | ✅ PASSED | Watcher removed successfully |
| 5 | Post-removal (clean) | ✅ PASSED | No agents triggered |

## Conclusion

The AgentWatch system partially works:
- ✅ Command processing (orchestrator) works
- ✅ Configuration management works
- ❌ Auto-triggering on PRs is broken
- ⚠️ Agent execution needs modularization

The main issue is that `agentwatch-auto-trigger.yml` doesn't trigger on pull_request events due to GitHub Actions issues. The system needs to be refactored to use the V2 workflow and implement proper modular agent execution.