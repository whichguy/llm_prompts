# Test Summary Agent Demo

This directory contains test files for demonstrating the PR Summary agent functionality.

## Files

- `user-service.js` - User management service with TODOs and FIXMEs
- `api-routes.ts` - TypeScript API routes with breaking changes
- `config.json` - Configuration file with sensitive data

## Purpose

These files are designed to trigger the PR Summary agent and test its ability to:
1. Detect different file types
2. Count TODOs and FIXMEs
3. Identify BREAKING CHANGES
4. Assess risk levels
5. Generate comprehensive summaries

## Notes

- Contains intentionally problematic code patterns
- Includes hardcoded secrets for testing detection
- No test files included (to trigger warnings)