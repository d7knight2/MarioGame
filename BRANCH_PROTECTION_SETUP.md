# Branch Protection Setup Guide

This guide explains how to configure branch protection rules to make unit tests and UI tests mandatory before merging pull requests.

## Overview

The repository has two primary test workflows that run on pull requests:

1. **Unit Tests** (`.github/workflows/ci.yml`) - Runs Jest unit tests
2. **UI Tests** (`.github/workflows/playwright.yml`) - Runs Playwright end-to-end tests

To ensure code quality and prevent broken code from being merged, these checks should be made mandatory through GitHub's branch protection rules.

## Prerequisites

- You must have admin access to the repository
- The workflows must have run at least once on the target branch

## Configuration Steps

### 1. Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar
4. Under "Branch protection rules", click **Add rule** (or edit an existing rule for `main`/`master`)

### 2. Configure the Protection Rule

In the branch protection rule configuration:

#### Basic Settings
- **Branch name pattern**: `main` (or `master` if that's your default branch)

#### Required Status Checks
1. Check the box: ☑ **Require status checks to pass before merging**
2. Check the box: ☑ **Require branches to be up to date before merging**
3. In the search box under "Status checks that are required", add the following checks:

   **For Unit Tests** (these will show as separate checks for each Node version):
   - `unit-tests (18.x)`
   - `unit-tests (20.x)`

   **For UI Tests** (these will show as separate checks for each browser):
   - `ui-tests (chromium)`
   - `ui-tests (firefox)`
   - `ui-tests (webkit)`

   > **Note**: These check names appear after the workflows have run at least once. If you don't see them in the search results, merge a PR or push to the main branch to trigger the workflows first.

#### Additional Recommended Settings (Optional)

- ☑ **Require a pull request before merging**
  - Minimum number of approvals: 1 (or as needed)
  
- ☑ **Require review from Code Owners** (if you have a CODEOWNERS file)

- ☑ **Dismiss stale pull request approvals when new commits are pushed**

- ☑ **Require conversation resolution before merging**

- ☑ **Do not allow bypassing the above settings**
  - Uncheck "Allow specified actors to bypass required pull requests" unless you have specific needs

### 3. Save the Protection Rule

Click the **Create** (or **Save changes**) button at the bottom of the page.

## Verification

After configuring branch protection:

1. Create a test pull request
2. You should see the following required checks in the PR:
   - ✓ unit-tests (18.x)
   - ✓ unit-tests (20.x)
   - ✓ ui-tests (chromium)
   - ✓ ui-tests (firefox)
   - ✓ ui-tests (webkit)
3. The "Merge" button should be disabled until all checks pass
4. If any check fails, the PR cannot be merged until fixed

## Troubleshooting

### Status Checks Don't Appear in Search

**Problem**: The required status check names don't appear when searching.

**Solution**: 
1. Push a commit to trigger the workflows
2. Wait for both workflows to complete
3. Return to branch protection settings and try searching again
4. The check names should now appear

### Too Many Required Checks

**Problem**: Requiring all browser/node version combinations might be too strict.

**Solution**: You can choose to require only a subset of checks, such as:
- Only Node 20.x for unit tests: `unit-tests (20.x)`
- Only Chromium for UI tests: `ui-tests (chromium)`

However, it's recommended to require all checks to ensure maximum compatibility.

### Fork Pull Requests

**Problem**: Checks from fork PRs don't run automatically for security reasons.

**Solution**: 
- The workflows are configured with `pull_request_target` to run on fork PRs
- This allows checks to run without manual approval
- **Security Note**: This configuration is suitable for this personal project but should be carefully considered for public/enterprise repositories

**Security Considerations for `pull_request_target`**:
- `pull_request_target` runs in the context of the base repository with access to secrets
- This enables potential cache poisoning attacks where malicious PRs could modify cached dependencies
- **Mitigation for this project**: The repository owner reviews all code before merging, making the risk acceptable
- **For higher-security projects**: Use `pull_request` instead and accept manual approval for fork PRs, or use a combination of `pull_request` with `workflow_run` to trigger workflows after initial security checks

## Workflow Details

### Unit Tests Workflow (`ci.yml`)
- **Trigger**: Push to main/master, pull requests to main/master
- **Jobs**: Runs on Node.js 18.x and 20.x
- **Steps**: 
  - Install dependencies
  - Run unit tests (`npm test`)
  - Run tests with coverage
  - Build project
  - Upload coverage reports

### UI Tests Workflow (`playwright.yml`)
- **Trigger**: Push to main/master, pull requests to main/master
- **Jobs**: Runs on Chromium, Firefox, and WebKit browsers
- **Steps**:
  - Install dependencies
  - Install Playwright browsers
  - Run Playwright tests for each browser
  - Upload test reports and videos on failure

## Managing Exceptions

If you need to merge a PR that fails checks in an emergency:

1. As an admin, you can temporarily bypass branch protection
2. Or temporarily disable the specific required check
3. Merge the PR
4. Re-enable the protection immediately after
5. Create a follow-up PR to fix the failing tests

**Important**: Document why checks were bypassed and ensure follow-up work is tracked.

## Maintaining Test Quality

To maintain the effectiveness of required checks:

1. **Keep tests fast**: Slow tests discourage development
2. **Fix flaky tests immediately**: Unreliable tests erode trust
3. **Review test coverage regularly**: Ensure critical paths are tested
4. **Update workflows as needed**: Keep dependencies and configurations current

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
