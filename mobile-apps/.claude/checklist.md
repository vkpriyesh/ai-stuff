# Shared Mobile Templates and Checklists

## PRD Review Checklist
- [ ] Does it define happy path?
- [ ] Does it define error states (network, auth)?
- [ ] Does it define offline behavior?
- [ ] Are analytics events specified?
- [ ] Are strings finalized (localization)?

## Security Review Checklist
- [ ] No secrets in repo?
- [ ] Network traffic HTTPS?
- [ ] Certificates pinned (if req)?
- [ ] Local storage encrypted?
- [ ] ProGuard/Obfuscation enabled?

## Release Smoke Test
1.  Fresh install launch.
2.  Login flow.
3.  Critical feature usage.
4.  Logout -> Login again.
5.  Network off behavior.
6.  Background/Foreground transition.
