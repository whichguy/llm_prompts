# Security Audit Test Document

## Purpose
This document is designed to test the PromptExpert security integration with AgentWatch. It contains various code samples with intentional security vulnerabilities.

## Authentication & Session Management

### Vulnerable Login Implementation
```javascript
// WARNING: This code has multiple security issues
function login(username, password) {
    // No rate limiting
    // No password hashing
    // SQL injection vulnerability
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    
    // Hardcoded admin bypass
    if (username === 'admin' && password === 'admin123') {
        return { success: true, isAdmin: true };
    }
    
    // Weak session token
    const token = btoa(username + ':' + Date.now());
    document.cookie = `session=${token}; path=/`;
    
    return executeQuery(query);
}
```

## API Security Issues

### Exposed API Keys
```python
# config.py
API_KEYS = {
    'stripe': 'sk_test_FAKE_KEY_FOR_TESTING_ONLY',
    'aws': 'AKIA_FAKE_AWS_KEY_EXAMPLE',
    'sendgrid': 'SG.FAKE_SENDGRID_KEY_FOR_TEST',
    'database': 'mongodb://admin:fakepass123@test.example.com:27017'
}

def make_api_call(service):
    # Direct key exposure in logs
    print(f"Using API key: {API_KEYS[service]}")
    headers = {'Authorization': f'Bearer {API_KEYS[service]}'}
    return headers
```

## Injection Vulnerabilities

### Command Injection
```bash
#!/bin/bash
# process_file.sh
filename=$1
# No input validation - command injection risk
eval "cat /uploads/$filename | process_data"
tar -xzf "/tmp/$filename"
```

### LDAP Injection
```java
public boolean authenticate(String user, String pass) {
    // LDAP injection vulnerability
    String filter = "(&(uid=" + user + ")(userPassword=" + pass + "))";
    DirContext ctx = new InitialDirContext(env);
    NamingEnumeration results = ctx.search("ou=users,dc=example,dc=com", filter, controls);
    return results.hasMore();
}
```

## Cryptographic Weaknesses

### Weak Encryption
```ruby
require 'digest'

class PasswordManager
  # Using MD5 for password hashing (deprecated)
  def hash_password(password)
    Digest::MD5.hexdigest(password)
  end
  
  # Predictable random values
  def generate_token
    rand(10000..99999).to_s
  end
  
  # ECB mode encryption (insecure)
  def encrypt_data(data)
    cipher = OpenSSL::Cipher.new('AES-128-ECB')
    cipher.encrypt
    cipher.key = 'weak_key_123456'
    cipher.update(data) + cipher.final
  end
end
```

## File Upload Vulnerabilities

### Unrestricted File Upload
```php
<?php
// upload.php
$target_dir = "/var/www/uploads/";
$target_file = $target_dir . $_FILES["file"]["name"];

// No file type validation
// No file size limits
// Path traversal vulnerability
move_uploaded_file($_FILES["file"]["tmp_name"], $target_file);

// Dangerous file execution
include($target_file);
?>
```

## CORS and CSP Issues

### Overly Permissive CORS
```javascript
// Express.js server
app.use((req, res, next) => {
    // Allows any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
```

## Expected Security Findings

The PromptExpert security review should identify:

1. **Critical Issues:**
   - Hardcoded credentials and API keys
   - SQL/Command/LDAP injection vulnerabilities
   - Weak cryptographic practices (MD5, ECB mode)
   - Unrestricted file uploads

2. **High Risk Issues:**
   - Missing authentication checks
   - No rate limiting
   - Overly permissive CORS
   - Path traversal vulnerabilities

3. **Medium Risk Issues:**
   - Weak random number generation
   - Missing input validation
   - Insecure session management
   - Direct inclusion of uploaded files

## Test Validation Criteria

A successful security review should:
- Identify at least 80% of the vulnerabilities
- Provide specific remediation recommendations
- Categorize issues by severity
- Reference security best practices (OWASP, etc.)