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
*Version: 1.2.0*
*Last Updated: 2025-01-08*

## Additional Security Checks
5. Scan for cross-site scripting (XSS) vulnerabilities
6. Review HTTPS/TLS configuration

## Additional Considerations

### OWASP Top 10 Compliance
- A01:2021 – Broken Access Control
- A02:2021 – Cryptographic Failures
- A03:2021 – Injection
- A04:2021 – Insecure Design
- A05:2021 – Security Misconfiguration
- A06:2021 – Vulnerable and Outdated Components
- A07:2021 – Identification and Authentication Failures
- A08:2021 – Software and Data Integrity Failures
- A09:2021 – Security Logging and Monitoring Failures
- A10:2021 – Server-Side Request Forgery (SSRF)

### GDPR and Privacy Requirements
- Data minimization principles
- Right to erasure implementation
- Consent management
- Data portability features
- Privacy by design approach

### Security Headers
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

### Automated Testing
- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)
- Software Composition Analysis (SCA)
- Infrastructure as Code (IaC) scanning