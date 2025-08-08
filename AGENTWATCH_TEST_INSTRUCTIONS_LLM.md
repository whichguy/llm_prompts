# AgentWatch Test Instructions for LLMs
## Reusable Testing Guide for AI Assistants

### Purpose
These instructions guide LLMs through testing the AgentWatch file monitoring and auto-trigger system. Follow these steps exactly to validate AgentWatch functionality.

### System Overview
AgentWatch monitors file changes in GitHub pull requests and automatically triggers configured agents when specific files are modified. You will test this by:
1. Creating a test file and PR
2. Using the @agent-watch command in PR comment
3. Verifying automatic triggering on subsequent file changes

### Prerequisites Check
Before starting, verify:
```bash
# Check current directory
pwd

# Verify Git repository
git status

# Check GitHub CLI authentication
gh auth status
```

### Test Execution Instructions

## Phase 1: Setup and Initial Configuration

### Step 1: Clean Up Previous Test Materials
Remove any existing test artifacts from previous runs:

```bash
# Return to main branch
git checkout main 2>/dev/null || true

# Pull latest changes
git pull origin main

# Delete local test branches if they exist
git branch -D test-agentwatch-pr1 test-agentwatch-pr2 agentwatch-test-base 2>/dev/null || true

# Delete remote test branches if they exist
git push origin --delete test-agentwatch-pr1 2>/dev/null || true
git push origin --delete test-agentwatch-pr2 2>/dev/null || true

# Remove test file if it exists (but keep instruction file)
rm -f security-audit-test.md

# Remove agentwatch configuration if it exists locally
rm -rf .github/agentwatch.yml

# Keep AGENTWATCH_TEST_INSTRUCTIONS_LLM.md - this should be committed to main

# Close any open test PRs
gh pr list --author "@me" --search "Test AgentWatch" --json number --jq '.[].number' | while read pr; do
  gh pr close $pr 2>/dev/null || true
done

echo "✅ Cleanup complete - ready for fresh test"
```

### Step 2: Create Test File
Create a test file that will be monitored. Use this exact content:

```bash
# Create the security audit test file
cat > security-audit-test.md << 'EOF'
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
*Version: 1.0.0*
*Last Updated: 2025-01-08*
EOF
```

### Step 3: Create First Test Branch
```bash
# Create and switch to test branch
git checkout -b test-agentwatch-pr1

# Add initial file
git add security-audit-test.md
git commit -m "Add initial security audit prompt for AgentWatch testing"
```

### Step 4: Modify File for PR
Make changes to demonstrate file modification:

```bash
# Update the file with additional checks
sed -i '' 's/Version: 1.0.0/Version: 1.1.0/' security-audit-test.md

# Add new security checks
cat >> security-audit-test.md << 'EOF'

## Additional Security Checks
5. Scan for cross-site scripting (XSS) vulnerabilities
6. Review HTTPS/TLS configuration
EOF

# Commit changes
git add security-audit-test.md
git commit -m "Add XSS and TLS checks to security audit prompt"
```

### Step 5: Push Branch and Create PR
```bash
# Push to remote
git push origin test-agentwatch-pr1

# Create PR using GitHub CLI
gh pr create \
  --title "Test AgentWatch: Add security checks" \
  --body "This PR tests the AgentWatch functionality by adding security checks.

## Changes
- Added XSS vulnerability scanning
- Added HTTPS/TLS configuration review
- Updated version to 1.1.0

## Test Plan
Will use @agent-watch command to monitor security-audit-test.md file." \
  --base main
```

### Step 6: Configure AgentWatch via PR Comment
After PR is created, add this comment to the PR:

```bash
# Get the PR number
PR_NUMBER=$(gh pr view --json number -q .number)

# Add agent-watch comment to the PR
gh pr comment $PR_NUMBER --body "@agent-watch security-audit-test.md security"
```

This comment will:
- Configure AgentWatch to monitor `security-audit-test.md`
- Set up `security` agent to analyze the file
- Automatically update `.github/agentwatch.yml` in the main branch

### Step 7: Verify Configuration
Wait for AgentWatch to respond and check the configuration:

```bash
# Wait for bot response (usually takes 30-60 seconds)
sleep 45

# Check main branch for configuration
git checkout main
git pull origin main

# Verify configuration file was created
cat .github/agentwatch.yml
```

Expected configuration:
```yaml
version: 1
watches:
  - pattern: "security-audit-test.md"
    agent: "security"
    args: ""
    added_by: "@username"
    added_at: "2025-01-08T..."
    pr: <pr_number>
```

### Step 8: Merge First PR
```bash
# Merge the PR to establish the watch pattern
gh pr merge $PR_NUMBER --merge

# Update local main branch
git checkout main
git pull origin main
```

## Phase 2: Test Auto-Trigger Functionality

### Step 9: Create Second Test Branch
```bash
# Create new branch for second PR
git checkout -b test-agentwatch-pr2
```

### Step 10: Modify Monitored File
Add comprehensive changes to trigger AgentWatch:

```bash
# Update version
sed -i '' 's/Version: 1.1.0/Version: 1.2.0/' security-audit-test.md

# Add OWASP and GDPR sections
cat >> security-audit-test.md << 'EOF'

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
EOF

# Commit changes
git add security-audit-test.md
git commit -m "Enhance security audit: Add OWASP, GDPR, Headers, and Testing

This commit adds comprehensive security considerations:
- OWASP Top 10 2021 compliance checklist
- GDPR and privacy requirements
- Security headers configuration
- Automated security testing strategies
- Updated version to 1.2.0

This change should trigger AgentWatch automatically."
```

### Step 11: Create Second PR and Verify Auto-Trigger
```bash
# Push to remote
git push origin test-agentwatch-pr2

# Create second PR
gh pr create \
  --title "Security Enhancement: OWASP, GDPR, and Headers" \
  --body "## Description
This PR enhances the security audit prompt with additional considerations.

## Changes
- Added OWASP Top 10 2021 compliance checklist
- Added GDPR and privacy requirements section
- Added security headers configuration guide
- Updated version to 1.2.0

## Expected Behavior
Since \`security-audit-test.md\` is being monitored by AgentWatch (configured in PR #$PR_NUMBER), this PR should automatically trigger the **security** agent.

## Verification
Watch for automatic agent comments analyzing these security changes." \
  --base main
```

### Step 12: Verify AgentWatch Triggered
```bash
# Get new PR number
PR2_NUMBER=$(gh pr view --json number -q .number)

# Check for agent comments (wait 1-2 minutes for agent to run)
sleep 60
gh pr view $PR2_NUMBER --comments

# Check GitHub Actions for agent runs
gh run list --limit 5
```

## Validation Steps

### Verify First PR Configuration
```bash
# Check that configuration was created in first PR
gh pr view $PR_NUMBER --comments | grep -A 5 "AgentWatch"
```

### Verify Second PR Auto-Trigger
```bash
# Check for automatic agent analysis in second PR
gh pr view $PR2_NUMBER --comments | grep -A 10 "Security"

# Verify agent was triggered
gh run list --workflow=security --limit 1
```

### Verify Configuration Persistence
```bash
# Check main branch has agentwatch.yml
git checkout main
git pull origin main
cat .github/agentwatch.yml | grep security-audit-test.md
```

## Expected Results

### Success Criteria
- [ ] Test file created with initial content
- [ ] First PR created with modifications
- [ ] @agent-watch command accepted in PR comment
- [ ] AgentWatch bot responds with confirmation
- [ ] .github/agentwatch.yml created automatically on main branch
- [ ] First PR merged successfully
- [ ] Second PR created with file changes
- [ ] AgentWatch automatically triggers on second PR
- [ ] Security agent posts analysis
- [ ] No manual intervention needed for second PR

### Expected Bot Responses

#### First PR (after @agent-watch command):
```
✅ **Global AgentWatch Pattern Added**

📁 **Pattern**: `security-audit-test.md`
🤖 **Agent**: security
⚙️ **Args**: none
🌍 **Scope**: Active across ALL repository branches
📝 **Config**: Updated `.github/agentwatch.yml` on `main` branch

This pattern will trigger on ANY PR with matching files.
```

#### Second PR (automatic):
```
🔒 **Security Analysis Report**

File Analyzed: `security-audit-test.md`

Security Enhancements Detected:
✅ OWASP Top 10 Compliance
✅ GDPR Requirements
✅ Security Headers
✅ Automated Testing

[Detailed analysis...]
```

## Cleanup Instructions

After testing, clean up test artifacts:

```bash
# Close PRs if still open
gh pr close $PR_NUMBER
gh pr close $PR2_NUMBER

# Return to main branch
git checkout main

# Delete local branches
git branch -D test-agentwatch-pr1 test-agentwatch-pr2

# Delete remote branches
git push origin --delete test-agentwatch-pr1 test-agentwatch-pr2

# Remove test file from main (if merged)
git rm security-audit-test.md
git commit -m "Clean up: Remove test file"
git push origin main
```

## Troubleshooting

### Common Issues and Solutions

1. **@agent-watch command not recognized**
   - Verify AgentWatch GitHub Action is installed in repo
   - Check Actions tab for AgentWatch workflow
   - Ensure bot has permissions to comment

2. **Configuration file not created**
   - Check if AgentWatch has write permissions to main branch
   - Look for error messages in Actions tab
   - Verify PR has proper base branch (main)

3. **Auto-trigger not working**
   - Ensure first PR was merged (not just closed)
   - Verify pattern matches exactly
   - Check if security agent workflow exists
   - Look for errors in GitHub Actions logs

4. **GitHub CLI issues**
   ```bash
   # Re-authenticate if needed
   gh auth refresh
   
   # Check PR status
   gh pr status
   ```

## Notes for LLMs

### Important Considerations
- Use actual PR comments, not simulated configuration
- Wait for bot responses before proceeding
- AgentWatch creates commits on main branch
- Pattern matching is case-sensitive
- Agent must exist as GitHub Action workflow

### Key Commands
- **Add watch**: `@agent-watch <pattern> <agent>`
- **Add watch with args**: `@agent-watch <pattern> <agent> @ <args>`
- **Remove watch**: `@agent-unwatch <agent> <pattern>`
- **List watches**: `@agent-list`

### Success Indicators
- ✅ AgentWatch bot responds to command
- ✅ Configuration committed to main branch
- ✅ Second PR shows agent activity
- ✅ GitHub Actions shows agent runs

## Summary

This test validates the complete AgentWatch workflow:
1. PR comment configuration (`@agent-watch` command)
2. Automatic configuration file creation on main branch
3. Pattern persistence after merge
4. Automatic triggering on file changes
5. Agent execution with correct parameters

The key is using the actual @agent-watch command in PR comments with the correct agent name (`security`).

---
*Instructions Version: 3.0*
*Purpose: Real AgentWatch testing guide for LLM assistants*
*System: AgentWatch file monitoring with PR comments*
*Last Updated: 2025-01-08*