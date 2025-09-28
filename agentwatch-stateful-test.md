# AgentWatch Stateful Test Document

This document is for testing the new stateful AgentWatch implementation with:
- Proper YAML state management on main branch
- Unwatch functionality (remove or exclude)
- Ignore functionality (direct exclude)
- Exclude list pattern matching

## Test Scenarios

### 1. Watch Pattern Test
- Add a watch for `*.md` files with `promptexpert` agent
- Verify it's added to `.github/agentwatch.yml` on main branch

### 2. Unwatch Test (Exact Match)
- Unwatch an existing pattern
- Should remove it from watches list

### 3. Unwatch Test (No Match)
- Unwatch a non-existing pattern
- Should add it to excludes list

### 4. Ignore Test
- Use @agent-ignore to exclude patterns
- Should add directly to excludes list

### 5. List Command Test
- Should show both watches and excludes
- Should show who added each and when

## Security Test Content

```javascript
// Intentionally vulnerable code for testing
const apiKey = "sk-test-1234567890abcdef";
eval(userInput); // Code injection vulnerability
```

## Test Update 1

Adding content to trigger PR update.

## Expected Behaviors

1. **State Persistence**: All changes should be saved to `.github/agentwatch.yml` on the main branch
2. **Exclude List**: Patterns in exclude list should not trigger agents even if matched by watch patterns
3. **Infinite Loop Protection**: github-actions[bot] comments should not trigger workflows