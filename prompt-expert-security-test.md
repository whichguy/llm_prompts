# Prompt Expert Security Test

## Test Purpose
This document tests the automatic triggering of prompt-expert when agent-watch monitors a file with security vulnerabilities.

## Authentication Vulnerabilities

### Insecure Password Storage
```javascript
// VULNERABILITY: Plain text password storage
function saveUser(username, password) {
    const userData = {
        username: username,
        password: password,  // Never store plain text passwords!
        created: Date.now()
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // VULNERABILITY: Password logged in console
    console.log(`User ${username} created with password: ${password}`);
}

// VULNERABILITY: Weak password comparison
function authenticate(inputPassword, storedPassword) {
    return inputPassword == storedPassword;  // Type coercion vulnerability
}
```

## Database Security Issues

### SQL Injection Vulnerability
```python
import sqlite3

def get_user(user_id):
    # VULNERABILITY: Direct SQL concatenation
    conn = sqlite3.connect('users.db')
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return conn.execute(query).fetchall()

def search_products(name):
    # VULNERABILITY: Unescaped user input in LIKE clause
    query = f"SELECT * FROM products WHERE name LIKE '%{name}%'"
    return execute_query(query)
```

## API Key Management

### Exposed Credentials
```yaml
# config.yml
database:
  host: production.db.example.com
  username: admin
  password: SuperSecret123!  # VULNERABILITY: Hardcoded password
  
api_keys:
  stripe: sk_test_EXAMPLE_KEY_123456  # VULNERABILITY: API key in config
  aws_access_key: AKIA_EXAMPLE_KEY
  aws_secret: example_secret_key_here
```

## Cross-Site Scripting (XSS)

### DOM-based XSS
```html
<!DOCTYPE html>
<html>
<head>
    <script>
        // VULNERABILITY: Direct innerHTML with user input
        function displayMessage() {
            const urlParams = new URLSearchParams(window.location.search);
            const message = urlParams.get('msg');
            document.getElementById('output').innerHTML = message;
        }
        
        // VULNERABILITY: eval() with user data
        function executeCode() {
            const code = document.getElementById('codeInput').value;
            eval(code);  // Never use eval with user input!
        }
    </script>
</head>
<body onload="displayMessage()">
    <div id="output"></div>
    <input type="text" id="codeInput">
    <button onclick="executeCode()">Run</button>
</body>
</html>
```

## Insecure File Operations

### Path Traversal
```ruby
class FileManager
  def download_file(filename)
    # VULNERABILITY: No path validation
    path = "/var/uploads/#{filename}"
    File.read(path)
  end
  
  def delete_file(user_path)
    # VULNERABILITY: Directory traversal possible
    File.delete("./data/#{user_path}")
  end
end
```

## Cryptographic Issues

### Weak Hashing
```java
import java.security.MessageDigest;

public class PasswordUtil {
    // VULNERABILITY: Using MD5 for password hashing
    public static String hashPassword(String password) {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(password.getBytes());
        return bytesToHex(hash);
    }
    
    // VULNERABILITY: No salt in password hashing
    public static boolean verifyPassword(String input, String hash) {
        return hashPassword(input).equals(hash);
    }
}
```

## Session Management

### Insecure Tokens
```php
<?php
// VULNERABILITY: Predictable session tokens
function generateSessionToken($userId) {
    return md5($userId . time());
}

// VULNERABILITY: Session fixation
session_start();
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
}

// VULNERABILITY: No session timeout
$_SESSION['user'] = $username;
$_SESSION['login_time'] = time();
// No expiration check
?>
```

## Expected Findings

The prompt-expert security analysis should identify:

1. **Authentication Issues:**
   - Plain text password storage
   - Weak password comparison
   - Password logging

2. **Injection Vulnerabilities:**
   - SQL injection in multiple functions
   - XSS through innerHTML and eval()
   - Path traversal in file operations

3. **Cryptographic Weaknesses:**
   - MD5 usage for passwords
   - Missing salt in hashing
   - Weak session token generation

4. **Configuration Issues:**
   - Hardcoded credentials
   - Exposed API keys
   - Insecure session management

## Success Criteria

- Agent-watch should detect this file when monitoring `*.md` files
- Prompt-expert should automatically analyze security issues
- Comments should be added to the PR with findings
- Security vulnerabilities should be properly categorized