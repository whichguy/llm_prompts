# Global Pattern Test - Security Test File

This file tests the new **global AgentWatch pattern system** by matching the pattern `security-test-*.md` that was added from a different branch.

## Test Objective
Validate that AgentWatch now works across all repository branches:
- Pattern was added from `agentwatch-stateful-validation` branch
- This PR is created from `test-global-patterns` branch  
- Pattern should still trigger because it's now **global**

## Expected Behavior
1. **Pattern Match**: File `security-test-global.md` matches global pattern `security-test-*.md`
2. **Agent Trigger**: Should trigger `promptexpert` agent with `security-analysis` args
3. **Cross-Branch**: Pattern added from different branch should work on this branch
4. **Automatic**: Should happen automatically on PR creation (no manual comment needed)

## Security Test Content

```javascript  
// Hardcoded API credentials
const API_SECRET = "prod-api-key-12345678";
const DATABASE_PASSWORD = "super_secret_password";

// SQL Injection vulnerability
function getUserData(userId) {
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    return database.execute(query); // Direct SQL injection risk
}

// Insecure random number generation  
function generateToken() {
    return Math.random().toString(36); // Predictable tokens
}

// Command injection vulnerability
function processFile(filename) {
    const cmd = `cat ${filename}`; // No input sanitization
    return exec(cmd);
}
```

```python
# Insecure password hashing
import hashlib
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()  # MD5 is cryptographically broken

# Hardcoded secrets in environment
os.environ['AWS_SECRET_KEY'] = 'AKIA1234567890ABCDEF'
os.environ['DATABASE_URL'] = 'postgres://admin:password123@prod-db:5432/app'

# Path traversal vulnerability
def read_file(filename):
    with open(f"/app/data/{filename}", 'r') as f:  # No path validation
        return f.read()
```

## Security Issues Summary
- **Hardcoded credentials** in source code
- **SQL injection** via unparameterized queries  
- **Command injection** through unsanitized input
- **Weak cryptography** using MD5 for passwords
- **Path traversal** allowing arbitrary file access
- **Predictable tokens** using Math.random()

## Expected AgentWatch Flow
1. PR created with `security-test-global.md`
2. AgentWatch check-patterns job runs automatically
3. Finds global pattern match: `security-test-*.md` -> `promptexpert`  
4. Triggers prompt-expert with security-analysis
5. Security analysis posted as PR comment

This validates that **global patterns work across all branches** in the repository!