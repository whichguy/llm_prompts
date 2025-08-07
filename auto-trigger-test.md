# Auto Trigger Test

This file should automatically trigger prompt-expert because we have a watch pattern for `*.md` files.

## Intentional Security Issues for Testing

```python
# SQL Injection vulnerability
query = f"SELECT * FROM users WHERE id = {user_input}"
cursor.execute(query)

# Hardcoded credentials
password = "admin123"
api_secret = "secret-key-12345"

# Command injection
import os
os.system(f"echo {user_data}")
```

## Expected Behavior

When this PR is created, the AgentWatch check-patterns job should:
1. Check `.github/agentwatch.yml` on main branch
2. Find the watch pattern for `*.md` files
3. Trigger prompt-expert with security args
4. Prompt-expert should comment on security issues