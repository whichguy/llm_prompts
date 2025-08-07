# Security Test - Authentication

This file matches the watched pattern `security-test-*.md` and should automatically trigger prompt-expert with security-analysis args.

## Authentication Security Issues

### 1. Weak Password Policy
```javascript
// No password complexity requirements
function validatePassword(password) {
    return password.length > 3; // Too weak!
}

// Storing passwords in plaintext
const userCredentials = {
    username: "admin",
    password: "123456"  // Plaintext password storage
};
```

### 2. JWT Token Issues
```javascript
// JWT without expiration
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: user.id }, 'weak-secret'); // No expiration!

// Weak JWT secret
const SECRET_KEY = "12345"; // Predictable secret

// No token validation
app.get('/protected', (req, res) => {
    const token = req.headers.authorization;
    // Missing: token validation, expiration check, secret verification
    res.json({ data: "sensitive data" });
});
```

### 3. Session Management
```python
# Insecure session handling
import flask
from flask import session

app = flask.Flask(__name__)
app.secret_key = "default"  # Weak secret key

@app.route('/login', methods=['POST'])
def login():
    # No rate limiting on login attempts
    username = request.form['username']
    password = request.form['password']
    
    # Vulnerable SQL query
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    result = db.execute(query)
    
    if result:
        session['user_id'] = result[0]['id']
        session.permanent = False  # Session never expires
```

### 4. API Key Management
```bash
# Hardcoded API keys in environment
export API_KEY="sk-1234567890abcdef"
export DATABASE_PASSWORD="admin123"

# API keys in version control
echo "STRIPE_KEY=pk_test_123456789" >> .env
git add .env  # Committing secrets!
```

### 5. OAuth Implementation Issues
```javascript
// Insecure OAuth redirect
app.get('/oauth/callback', (req, res) => {
    const redirectUrl = req.query.redirect_uri;
    // No validation of redirect URL - open redirect vulnerability
    res.redirect(redirectUrl);
});

// Missing CSRF protection
app.post('/oauth/authorize', (req, res) => {
    // No state parameter validation
    const clientId = req.body.client_id;
    const scope = req.body.scope;
    
    // Grant access without proper validation
    generateAccessToken(clientId, scope);
});
```

## Expected AgentWatch Behavior

1. **Pattern Match**: This file matches `security-test-*.md` pattern
2. **Agent Trigger**: Should automatically trigger `promptexpert` agent  
3. **Args**: Should pass `security-analysis` as arguments
4. **Analysis**: Prompt-expert should identify and comment on security issues above

## Security Issues Summary

- Weak password validation
- Plaintext password storage  
- JWT tokens without expiration
- Weak JWT secrets
- Missing authentication validation
- SQL injection vulnerabilities
- Hardcoded credentials
- Insecure session management
- Open redirect vulnerabilities
- Missing CSRF protection
- API keys in version control