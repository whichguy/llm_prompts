# Security Audit Prompt

## Purpose
This prompt is designed to perform basic security audits on code repositories.

## Security Checks
1. Check for hardcoded credentials
2. Identify potential SQL injection vulnerabilities
3. Review authentication mechanisms
4. Analyze authorization controls

## Instructions
When reviewing code, focus on:
- Input validation
- Output encoding
- Authentication flows
- Session management

## Risk Assessment
Categorize findings as:
- Critical: Immediate action required
- High: Should be fixed in current sprint
- Medium: Plan for next release
- Low: Track in backlog

## Reporting Format
All findings should include:
- Description of the issue
- Affected files/lines
- Potential impact
- Recommended remediation

---
*Version: 1.1.0*
*Last Updated: 2025-01-08*

## Additional Security Checks
5. Scan for cross-site scripting (XSS) vulnerabilities
6. Review HTTPS/TLS configuration