# AI Prompts Library

This document contains reusable prompts for AI agents to perform common tasks on the Bill Barta codebase.

---

## Prompt 1: Documentation Generator

```markdown
# Task: Generate Documentation

You are a technical documentation expert. Generate comprehensive documentation for the specified feature/component in the Bill Barta codebase.

## Target

[Feature/Component name]

## Instructions

1. Read all relevant source files for the target feature
2. Understand the purpose, inputs, outputs, and dependencies
3. Generate documentation following this structure:

### Output Structure

# [Feature Name]

## Overview

Brief description of what this feature does and why it exists.

## Architecture

How this feature fits into the overall system. Include a diagram if helpful.

## API Reference

For each public method/endpoint:

- Signature
- Parameters (with types)
- Return value
- Possible errors
- Example usage

## Configuration

Any environment variables or settings that affect this feature.

## Dependencies

Other modules/services this feature depends on.

## Usage Examples

Code examples showing common use cases.

## Troubleshooting

Common problems and their solutions.

## Quality Criteria

- Accurate to the codebase
- Professional technical writing
- Consistent with existing documentation style
- Includes practical examples
```

---

## Prompt 2: Security Audit

```markdown
# Task: Security Audit

You are a security expert specializing in web application security. Perform a comprehensive security audit of the Bill Barta codebase.

## Scope

[All code / Specific feature]

## Checklist

### Authentication & Authorization

- [ ] JWT implementation security
- [ ] Token expiration and refresh
- [ ] Protected routes coverage
- [ ] User ID validation
- [ ] Session management

### Input Validation

- [ ] All endpoints have validation
- [ ] Zod schemas cover all fields
- [ ] No SQL injection vectors
- [ ] No XSS vulnerabilities
- [ ] File upload security (if applicable)

### Data Protection

- [ ] Sensitive data encrypted at rest
- [ ] Encryption implementation review
- [ ] Key management practices
- [ ] Data transmission security

### Configuration Security

- [ ] No hardcoded secrets
- [ ] Environment variable usage
- [ ] Production-ready defaults
- [ ] CORS configuration

### Logging & Monitoring

- [ ] No sensitive data in logs
- [ ] Error messages don't leak info
- [ ] Security events logged

### Dependencies

- [ ] Known vulnerabilities in deps
- [ ] Outdated dependencies
- [ ] Unnecessary dependencies

## Output Format

# Security Audit Report

**Date**: [Date]
**Scope**: [Scope]

## Executive Summary

Brief overview of findings.

## Critical Issues

Issues requiring immediate attention.

## High Severity Issues

Significant security risks.

## Medium Severity Issues

Moderate security risks.

## Low Severity Issues

Minor security concerns.

## Recommendations

Prioritized list of improvements.

## Compliance Notes

Relevant security standards compliance status.
```

---

## Prompt 3: Performance Optimization

```markdown
# Task: Performance Optimization

You are a performance optimization expert. Analyze the specified area of the Bill Barta codebase and identify optimization opportunities.

## Target

[Specific feature/endpoint/component]

## Analysis Areas

### Backend Performance

- Database query efficiency
- N+1 query problems
- Caching effectiveness
- API response times
- Memory usage patterns

### Frontend Performance

- Bundle size
- Component re-renders
- Data fetching patterns
- Image optimization
- Lazy loading opportunities

### Network Performance

- Request/response sizes
- Compression usage
- CDN potential
- API call reduction

## Output Format

# Performance Analysis Report

## Current State

Baseline measurements and observations.

## Identified Issues

List of performance problems found.

## Optimization Opportunities

### High Impact

Changes with significant performance benefit.

### Medium Impact

Moderate improvement opportunities.

### Low Impact

Minor optimizations.

## Recommendations

Prioritized implementation plan.

## Expected Improvements

Estimated performance gains.
```

---

## Prompt 4: Architecture Analysis

```markdown
# Task: Architecture Analysis

You are a software architect. Analyze the Bill Barta codebase architecture and provide insights.

## Focus Areas

### Current Architecture

- Identify architectural patterns in use
- Document component relationships
- Map data flow through the system
- Identify coupling and cohesion

### Best Practices Assessment

- SOLID principles adherence
- Separation of concerns
- Error handling patterns
- Scalability considerations

### Technical Debt

- Code duplication
- Overly complex components
- Missing abstractions
- Outdated patterns

## Output Format

# Architecture Analysis Report

## Architecture Overview

Description of the current architecture.

## Architecture Diagram
```

[ASCII or Mermaid diagram]

```

## Component Analysis
Per-component evaluation.

## Pattern Assessment
How well architectural patterns are implemented.

## Strengths
What's working well.

## Areas for Improvement
Recommended architectural changes.

## Evolution Roadmap
Suggested architectural evolution path.
```

---

## Prompt 5: Dependency Review

```markdown
# Task: Dependency Review

You are a dependency management expert. Review the dependencies in the Bill Barta codebase.

## Scope

- server/package.json
- client/package.json

## Analysis

### Direct Dependencies

- Purpose of each dependency
- Alternatives available
- Version currency

### Security

- Known vulnerabilities
- Security advisories
- Maintenance status

### Bundle Impact (Frontend)

- Bundle size contribution
- Tree-shaking effectiveness

### Recommendations

- Dependencies to update
- Dependencies to replace
- Dependencies to remove

## Output Format

# Dependency Review Report

## Summary

Overview of dependency health.

## Critical Updates Required

Dependencies with security issues.

## Recommended Updates

Dependencies with available updates.

## Unused Dependencies

Dependencies that may be removable.

## Alternative Suggestions

Better alternatives for current dependencies.

## Action Items

Prioritized list of dependency changes.
```

---

## Prompt 6: Code Review

```markdown
# Task: Code Review

You are a senior software engineer. Perform a thorough code review of the specified changes or files.

## Target

[File path(s) or PR description]

## Review Criteria

### Functionality

- Does the code work correctly?
- Are edge cases handled?
- Is error handling appropriate?

### Code Quality

- Is the code readable?
- Are names meaningful?
- Is there code duplication?

### Architecture

- Does it follow project patterns?
- Is the logic in the right layer?
- Are dependencies appropriate?

### Security

- Input validation present?
- Sensitive data handled correctly?
- No security regressions?

### Performance

- Any obvious performance issues?
- Appropriate caching usage?

### Documentation

- Are complex parts documented?
- API documentation needed?

## Output Format

# Code Review Feedback

## Summary

Overall assessment.

## Must Fix

Issues that must be addressed.

## Should Fix

Important improvements.

## Consider

Suggestions for consideration.

## Positive Notes

What's done well.
```

---

## Prompt 7: Test Generation

```markdown
# Task: Generate Tests

You are a testing expert. Generate comprehensive tests for the specified code.

## Target

[Service/Component name]

## Test Types Needed

- Unit tests
- Integration tests (if applicable)
- Edge case tests
- Error scenario tests

## Framework

- Backend: Jest + ts-jest
- Frontend: (if applicable) Vitest or Jest

## Output Format

Provide test code in the appropriate test file location with:

- Descriptive test names
- Arrange-Act-Assert pattern
- Proper mocking
- Complete coverage of public API
- Edge case coverage
- Error case coverage
```

---

## Prompt 8: Migration Guide

```markdown
# Task: Create Migration Guide

You are a technical writer. Create a migration guide for upgrading or changing a specific aspect of Bill Barta.

## Migration Type

[Dependency upgrade / Architecture change / API change]

## Structure

# Migration Guide: [Title]

## Overview

What is changing and why.

## Prerequisites

What must be done before migration.

## Step-by-Step Migration

### Step 1: [Action]

Detailed instructions.

### Step 2: [Action]

...

## Verification

How to verify successful migration.

## Rollback

How to rollback if issues arise.

## Breaking Changes

List of breaking changes.

## FAQ

Common questions during migration.
```

---

## Prompt 9: Bug Investigation

```markdown
# Task: Investigate Bug

You are a debugging expert. Investigate the reported bug in the Bill Barta codebase.

## Bug Report

[Description of the bug]

## Investigation Steps

1. Reproduce the issue (understand conditions)
2. Trace the code path
3. Identify the root cause
4. Propose fix options

## Output Format

# Bug Investigation Report

## Summary

Brief description of the bug.

## Reproduction Steps

How to reproduce.

## Root Cause Analysis

Explanation of why the bug occurs.

## Code Path

Relevant files and lines of code.

## Fix Options

### Option 1

Description and trade-offs.

### Option 2

...

## Recommended Fix

Which option and why.

## Testing Notes

How to verify the fix.

## Prevention

How to prevent similar bugs.
```

---

## Prompt 10: Feature Planning

```markdown
# Task: Plan New Feature

You are a software architect. Help plan the implementation of a new feature for Bill Barta.

## Feature Request

[Description of desired feature]

## Planning Output

# Feature Plan: [Feature Name]

## Overview

What the feature does.

## User Stories

- As a [user], I want to [action] so that [benefit].

## Technical Design

### Backend Changes

- New entities
- New services
- New endpoints
- Database migrations

### Frontend Changes

- New components
- New pages
- New API clients
- State management

### Infrastructure Changes

- Environment variables
- Docker changes
- Database changes

## API Design

Endpoint specifications.

## Data Model

Entity definitions.

## Implementation Plan

Ordered list of implementation steps.

## Testing Strategy

How the feature will be tested.

## Documentation Needs

What documentation to create/update.

## Risks

Potential challenges and mitigations.

## Estimated Effort

Time/complexity estimate.
```
