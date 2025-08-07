# AgentWatch Comprehensive Test Plan

## Test Overview
This test validates the complete lifecycle of the AgentWatch system, including:
- Baseline behavior (no watchers)
- Adding watchers via comments
- Auto-triggering on new PRs
- Removing watchers
- Confirming removal works

## Prerequisites
- [ ] Ensure `.github/agentwatch.yml` exists and has `watchers: []` (empty)
- [ ] AgentWatch workflows are present in `.github/workflows/`
- [ ] Test branch and files are ready

## Test Phases

### Phase 1: Baseline - No Watchers Configured
**Objective**: Verify no agents trigger when no watchers are configured

1. **Setup**
   - Verify `.github/agentwatch.yml` has empty watchers array
   - Create test branch: `test-agentwatch-baseline`
   - Create test file: `test-files/baseline.js`

2. **Create PR**
   - Open PR from test branch to main
   - Title: "[Test] AgentWatch Phase 1: Baseline"

3. **Validation** (Wait 30-60 seconds)
   - [ ] Check workflow runs - AgentWatch workflows should run but find no watchers
   - [ ] Verify NO agent labels added (no `agent:pending:*`, `agent:running:*`, or `agent:reviewed:*`)
   - [ ] Check PR comments - no agent comments should appear
   - Expected: Clean PR with no agent activity

### Phase 2: Add Watcher via Comment
**Objective**: Test @agent-watch command to add a watcher

1. **Add Watcher Comment**
   - On the same PR, add comment: `@agent-watch pr-summary test-files/*.js`
   - This should trigger the AgentWatch Orchestrator workflow

2. **Validation** (Wait 60-90 seconds)
   - [ ] Check AgentWatch Orchestrator workflow runs successfully
   - [ ] Verify `.github/agentwatch.yml` updated with new watcher:
     ```yaml
     watchers:
       - name: pr-summary for test-files/*.js
         agent: pr-summary
         pattern: test-files/*.js
         exclude: []
         added_by: [username]
         added_at: [timestamp]
         pr_number: [PR#]
     ```
   - [ ] Verify agent executes on existing PR files
   - [ ] Check for labels progression:
     - `agent:pending:pr-summary` → `agent:running:pr-summary` → `agent:reviewed:pr-summary`
   - [ ] Verify agent comment appears (e.g., PR summary)

### Phase 3: Auto-Trigger on New PR
**Objective**: Verify watchers auto-trigger on new PRs matching patterns

1. **Setup**
   - Create new branch: `test-agentwatch-auto`
   - Create/modify file matching pattern: `test-files/auto-test.js`

2. **Create Second PR**
   - Open PR from new branch to main
   - Title: "[Test] AgentWatch Phase 3: Auto-Trigger"

3. **Validation** (Wait 60-90 seconds)
   - [ ] AgentWatch Auto Trigger workflow should run automatically
   - [ ] Agent should trigger WITHOUT manual intervention
   - [ ] Check for labels progression:
     - `agent:pending:pr-summary` → `agent:running:pr-summary` → `agent:reviewed:pr-summary`
   - [ ] Verify agent comment appears
   - Expected: Agent runs automatically based on file pattern match

### Phase 4: Remove Watcher
**Objective**: Test @agent-unwatch command to remove a watcher

1. **Remove Watcher Comment**
   - On either PR, add comment: `@agent-unwatch pr-summary test-files/*.js`
   - This should trigger the AgentWatch Orchestrator workflow

2. **Validation** (Wait 30-60 seconds)
   - [ ] Check AgentWatch Orchestrator workflow runs successfully
   - [ ] Verify `.github/agentwatch.yml` updated:
     ```yaml
     watchers: []  # Should be empty again
     ```
   - [ ] Confirm watcher removal message in PR

### Phase 5: Verify Removal - Clean PR
**Objective**: Confirm agents don't trigger after watcher removal

1. **Setup**
   - Create new branch: `test-agentwatch-removed`
   - Create/modify file that previously matched: `test-files/final-test.js`

2. **Create Third PR**
   - Open PR from new branch to main
   - Title: "[Test] AgentWatch Phase 5: Post-Removal"

3. **Validation** (Wait 30-60 seconds)
   - [ ] AgentWatch workflows should run but find no matching watchers
   - [ ] Verify NO agent labels added
   - [ ] Check PR comments - no agent comments should appear
   - Expected: Clean PR with no agent activity (same as Phase 1)

## Success Criteria

### ✅ Test Passes If:
1. **Phase 1**: No agents trigger with empty watchers
2. **Phase 2**: @agent-watch successfully adds watcher and triggers agent
3. **Phase 3**: New PR auto-triggers matching agent
4. **Phase 4**: @agent-unwatch successfully removes watcher
5. **Phase 5**: No agents trigger after watcher removal

### ❌ Test Fails If:
- Agents trigger when no watchers configured
- @agent-watch command doesn't add watcher or trigger agent
- New PRs don't auto-trigger matching agents
- @agent-unwatch doesn't remove watcher
- Agents still trigger after watcher removal
- Any workflow errors or unexpected behavior

## Test Execution Commands

```bash
# Phase 1: Setup and create baseline PR
git checkout -b test-agentwatch-baseline
mkdir -p test-files
echo "// Baseline test file" > test-files/baseline.js
git add test-files/baseline.js
git commit -m "Add baseline test file"
git push -u origin test-agentwatch-baseline
gh pr create --title "[Test] AgentWatch Phase 1: Baseline" --body "Testing baseline - no watchers"

# Phase 2: Add watcher (in PR comment)
gh pr comment [PR#] --body "@agent-watch pr-summary test-files/*.js"

# Phase 3: Create auto-trigger PR
git checkout -b test-agentwatch-auto
echo "// Auto-trigger test file" > test-files/auto-test.js
git add test-files/auto-test.js
git commit -m "Add auto-trigger test file"
git push -u origin test-agentwatch-auto
gh pr create --title "[Test] AgentWatch Phase 3: Auto-Trigger" --body "Testing auto-trigger with watcher"

# Phase 4: Remove watcher (in PR comment)
gh pr comment [PR#] --body "@agent-unwatch pr-summary test-files/*.js"

# Phase 5: Create post-removal PR
git checkout -b test-agentwatch-removed
echo "// Post-removal test file" > test-files/final-test.js
git add test-files/final-test.js
git commit -m "Add post-removal test file"
git push -u origin test-agentwatch-removed
gh pr create --title "[Test] AgentWatch Phase 5: Post-Removal" --body "Testing post-removal - no watchers"
```

## Cleanup

After test completion:
```bash
# Close test PRs
gh pr close [PR#1] [PR#2] [PR#3]

# Delete test branches
git branch -D test-agentwatch-baseline test-agentwatch-auto test-agentwatch-removed
git push origin --delete test-agentwatch-baseline test-agentwatch-auto test-agentwatch-removed

# Clean up test files
rm -rf test-files/

# Reset agentwatch.yml
echo "watchers: []" > .github/agentwatch.yml
git add .github/agentwatch.yml
git commit -m "Reset agentwatch configuration after testing"
git push
```

## Notes

- Allow 30-90 seconds between actions for workflows to complete
- Check GitHub Actions tab for workflow run details
- Use `gh run list` and `gh pr view [PR#]` for command-line monitoring
- Agent labels should progress through states: pending → running → reviewed
- The `pr-summary` agent is used as an example; replace with actual agent names as needed