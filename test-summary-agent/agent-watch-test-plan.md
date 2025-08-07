# Agent-Watch Complete Lifecycle Test Plan

## Test Objective
Validate the complete lifecycle of agent-watch functionality including:
- Initial state with no watchers
- Manual watcher addition via PR comment
- Automatic triggering on subsequent PRs
- Watcher removal
- Verification of removed watcher

## Test Environment
- Repository: whichguy/llm_prompts
- Agent: pr-summary
- Test file pattern: `test-files/*.js`
- Branch naming: `test-agent-watch-{step}`

## Pre-Test Setup
1. **Clean Repository State**
   - Ensure `.github/agentwatch.yml` exists but has no active watchers
   - Remove any existing test branches
   - Clear any existing test PRs

## Test Steps

### Phase 1: Baseline - No Watchers
**Step 1.1: Verify Clean State**
- Check `.github/agentwatch.yml` has empty watchers array
- Confirm no existing PR labels with `agent:` prefix

**Step 1.2: Create Test PR #1**
- Branch: `test-agent-watch-1`
- File: `test-files/baseline.js`
- Content: Simple JavaScript file with TODO comments
- Create PR without any agent mentions

**Step 1.3: Wait and Verify No Triggers**
- Wait 2 minutes
- Verify:
  - No workflow runs triggered
  - No `agent:pending:*` labels added
  - No `agent:running:*` labels added
  - No `agent:reviewed:*` labels added
  - PR comment count unchanged

### Phase 2: Manual Watcher Addition
**Step 2.1: Add Watcher via Comment**
- Add comment to PR #1: `@agent-watch pr-summary test-files/*.js`
- Expected immediate response:
  ```
  ✅ Watcher added:
  - Agent: pr-summary
  - Pattern: test-files/*.js
  - Excludes: []
  ```

**Step 2.2: Verify Agent Execution**
- Monitor workflow runs
- Expected sequence:
  1. `agent:pending:pr-summary` label added
  2. Workflow "AgentWatch" starts
  3. `agent:running:pr-summary` label replaces pending
  4. Agent posts summary comment
  5. `agent:reviewed:pr-summary` label replaces running

**Step 2.3: Validate Results**
- Verify summary comment contains:
  - File statistics
  - TODO/FIXME counts
  - Risk assessment
  - Recommendations
- Confirm final label: `agent:reviewed:pr-summary`

### Phase 3: Automatic Triggering
**Step 3.1: Create Test PR #2**
- Branch: `test-agent-watch-2`
- File: `test-files/auto-trigger.js`
- Content: Different JavaScript file with FIXMEs
- Create PR without agent mentions

**Step 3.2: Verify Automatic Trigger**
- Expected behavior within 30 seconds:
  - Workflow automatically starts
  - Labels cycle: pending → running → reviewed
  - Summary comment posted automatically
- No manual intervention required

**Step 3.3: Validate Watcher Persistence**
- Check `.github/agentwatch.yml` still contains:
  ```yaml
  watchers:
    - name: "PR Summary for test-files"
      agent: "pr-summary"
      pattern: "test-files/*.js"
      exclude: []
      added_by: "whichguy"
      added_at: "<timestamp>"
      pr_number: 1
  ```

### Phase 4: Watcher Removal
**Step 4.1: List Active Watchers**
- Add comment to any PR: `@agent-list`
- Verify response shows active watcher

**Step 4.2: Remove Watcher**
- Add comment: `@agent-unwatch pr-summary test-files/*.js`
- Expected response:
  ```
  ✅ Watcher removed:
  - Agent: pr-summary
  - Pattern: test-files/*.js
  ```

**Step 4.3: Verify Removal**
- Check `.github/agentwatch.yml` updated
- Watcher removed from configuration

### Phase 5: Verify No Triggers After Removal
**Step 5.1: Create Test PR #3**
- Branch: `test-agent-watch-3`
- File: `test-files/no-trigger.js`
- Content: JavaScript file matching previous pattern
- Create PR without agent mentions

**Step 5.2: Wait and Verify No Triggers**
- Wait 2 minutes
- Verify:
  - No workflow runs triggered
  - No agent labels added
  - No automated comments
  - PR remains untouched by agents

## Success Criteria
✅ **Phase 1**: No agents trigger without watchers
✅ **Phase 2**: Manual watcher addition works and triggers agent
✅ **Phase 3**: Automatic triggering works for matching files
✅ **Phase 4**: Watcher removal successfully removes configuration
✅ **Phase 5**: No triggers occur after watcher removal

## Validation Points
1. **Label Lifecycle**: pending → running → reviewed/failed
2. **Configuration Persistence**: Changes saved to `.github/agentwatch.yml`
3. **Pattern Matching**: Only files matching pattern trigger agent
4. **User Attribution**: Watcher tracks who added it and when
5. **PR Association**: Watcher remembers originating PR number

## Edge Cases to Test (Optional)
- Multiple watchers for same pattern
- Overlapping patterns
- Exclusion patterns
- Multiple agents on same PR
- Watcher modification (pattern change)
- Invalid agent names
- Malformed patterns

## Cleanup
After test completion:
1. Close all test PRs
2. Delete test branches
3. Remove test files
4. Clear any remaining watchers from config

## Test Execution Log Template
```markdown
### Test Run: [Date]
- Tester: [Name]
- Repository: whichguy/llm_prompts
- Start Time: [Time]

#### Phase 1: Baseline
- [ ] Clean state verified
- [ ] PR #1 created: #[number]
- [ ] No triggers confirmed after 2 min

#### Phase 2: Manual Addition
- [ ] Watcher added via comment
- [ ] Agent executed successfully
- [ ] Labels cycled correctly
- [ ] Summary comment posted

#### Phase 3: Auto-Trigger
- [ ] PR #2 created: #[number]
- [ ] Auto-triggered within 30s
- [ ] Correct execution completed

#### Phase 4: Removal
- [ ] Watcher listed correctly
- [ ] Watcher removed successfully
- [ ] Config updated

#### Phase 5: No Trigger
- [ ] PR #3 created: #[number]
- [ ] No triggers after 2 min
- [ ] Confirmed inactive

End Time: [Time]
Result: PASS/FAIL
```

## Notes
- Allow 30-60 seconds between operations for GitHub Actions to process
- Check both Actions tab and PR labels for status
- Verify `.github/agentwatch.yml` after each watcher change
- Screenshot important state changes for documentation