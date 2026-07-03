# Release Runbook — PharmaConnect v2.0

Owner: release-engineer
Approval: `/ship` + `/land-and-deploy`

## Pre-flight Checklist

- [ ] `/review` passes
- [ ] `/qa` full pass
- [ ] `/cso` sign-off
- [ ] Lighthouse >= 90 on mobile and desktop
- [ ] All migrations proposed and approved
- [ ] No secrets in repo; env vars in Xano + Cloudflare env

## Deploy Steps

1. Merge target branch into `main` via PR
2. Tag release: `git tag v2.x.x && git push --tags`
3. Trigger Cloudflare Pages deploy from GitHub Actions
4. Verify health endpoint: `https://pharmaconnect.pages.dev/health`

## Rollback

- Cloudflare Pages: revert to previous production deployment
- Xano: rollback function versions
- Database: use audit_logs to trace changes; restore via Xano backup if needed

## Post-release

- Run `/document-release` to sync docs
- Verify payment webhooks with sandbox
- Confirm FCM token count in analytics
- Run `/retro`
