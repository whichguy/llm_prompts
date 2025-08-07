# Authentication Security Review

This file will be our **target file** for AgentWatch precision testing.

## Purpose
Test AgentWatch's ability to:
1. Target specific files with precise patterns
2. Maintain global patterns across PR closures  
3. Trigger only on specified files, not unrelated ones

## Authentication Security Analysis

### Current Implementation Issues

```javascript
// Weak session management
function createSession(user) {
    const sessionId = Math.random().toString(36).substring(7); // Predictable IDs
    const session = {
        userId: user.id,
        created: new Date(),
        expires: null  // Sessions never expire!
    };
    
    // Store in plain object (memory leak risk)
    global.sessions[sessionId] = session;
    return sessionId;
}

// No password strength validation
function validatePassword(password) {
    return password.length >= 6; // Too weak!
}

// Insecure password storage
function saveUser(userData) {
    const user = {
        email: userData.email,
        password: userData.password, // Stored in plaintext!
        role: userData.role || 'user'
    };
    
    database.users.push(user);
    return user;
}
```

### Python Authentication Issues

```python
# Insecure authentication bypass
def authenticate_user(username, password):
    if username == "admin":
        return True  # Hardcoded bypass!
    
    # SQL injection vulnerability
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    result = db.execute(query)
    return len(result) > 0

# Weak token generation
import secrets
def generate_api_token():
    return "token_" + str(random.randint(1000, 9999))  # Not cryptographically secure!

# Missing rate limiting
login_attempts = {}
def check_rate_limit(ip_address):
    # TODO: Implement rate limiting
    return True  # Always allows login attempts
```

## Security Recommendations

1. **Session Security**
   - Use cryptographically secure session ID generation
   - Implement proper session expiration
   - Store sessions securely (Redis/database)

2. **Password Security**  
   - Enforce strong password requirements
   - Hash passwords with bcrypt/argon2
   - Implement password history

3. **Authentication Security**
   - Remove hardcoded bypasses
   - Use parameterized queries
   - Implement proper rate limiting

4. **Token Security**
   - Use cryptographically secure random generation
   - Implement token expiration
   - Store tokens securely

## Test Expectation

When we add an AgentWatch pattern for `auth-review.md`, it should:
- ✅ Trigger prompt-expert for this file specifically
- ✅ NOT trigger for unrelated files in the same PR
- ✅ Work across different PRs (global persistence)
- ✅ Maintain precision in file targeting