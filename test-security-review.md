# Security Review Test Document

## Overview
This document contains sample code for testing the PromptExpert security integration with AgentWatch.

## Sample Code Sections

### Authentication Implementation
```javascript
// Sample authentication code
function authenticateUser(username, password) {
    // TODO: Add proper validation
    const token = btoa(username + ':' + password);
    localStorage.setItem('authToken', token);
    return token;
}

function checkAuth() {
    const token = localStorage.getItem('authToken');
    // Direct comparison without timing safety
    if (token === 'expected_token') {
        return true;
    }
    return false;
}
```

### API Key Management
```python
# Configuration file
API_KEY = "sk-1234567890abcdef"
DATABASE_PASSWORD = "admin123"

def connect_to_api():
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    # API call here
    pass
```

### SQL Query Construction
```php
<?php
function getUserData($userId) {
    $query = "SELECT * FROM users WHERE id = " . $userId;
    $result = mysql_query($query);
    return $result;
}

function searchProducts($searchTerm) {
    $sql = "SELECT * FROM products WHERE name LIKE '%" . $searchTerm . "%'";
    // Execute query
}
?>
```

### Cross-Site Scripting Vectors
```html
<script>
function displayUserContent(content) {
    document.getElementById('output').innerHTML = content;
}

function showMessage(msg) {
    eval('alert("' + msg + '")');
}
</script>
```

### Insecure File Operations
```ruby
def process_upload(filename)
  # No path validation
  File.open("/var/uploads/#{filename}", "w") do |f|
    f.write(params[:content])
  end
  
  # Command injection risk
  system("process_file #{filename}")
end
```

## Security Considerations
This document intentionally contains security vulnerabilities for testing purposes. The PromptExpert security review should identify:

1. Hardcoded credentials
2. SQL injection vulnerabilities
3. XSS attack vectors
4. Command injection risks
5. Insecure authentication patterns
6. Path traversal vulnerabilities

## Expected Outcome
The security expert should flag all the issues above and provide recommendations for fixing them.