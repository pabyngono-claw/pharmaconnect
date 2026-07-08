# PharmaConnect — Agent Handoff Ledger

Card Schema: `{id, title, owner, state, branch, worktree, acceptance, merge_gate, handoff}`

Board

## Merged
- PC-01 Design tokens and component-color mapping
- PC-02 Xano schema reference
- PC-10 Release runbook

## Running
- PC-03 Reservation/waiting/request state machines
- PC-04 Patient request screen specs
- PC-05 OTP/OAuth auth flows
- PC-06 Payment idempotency and TVA server-side
- PC-07 Admin approval workflow
- PC-08 QA regression pack
- PC-09 Cloudflare Workers + CI
- PC-B1 Xano import manifest and API snapshot
- PC-B2 Xano scheduled tasks and function stubs
- PC-B3 FlutterFlow implementation guide and routing
- PC-B4 Admin approval implementation guide
- PC-B5 Cloudflare Worker starter template
- PC-B6 Environment/secrets checklist and deployment policy
- PC-B7 QA automation plan and evidence structure

## Ready
- PC-R1 Xano workspace provisioning and table creation
- PC-R2 Cloudflare secrets setup for CI
- PC-R3 Xano backend-to-backend calls enabled
- PC-R4 Cloudflare Pages project init with account token
- PC-R5 `backend/xano/schema.sql` ready for direct execution/schema import

## Blocked
- (none currently)

Agent Protocol
1. Pick a card from Ready if any; else Running.
2. Produce file artifacts under the agreed path.
3. Update this board state when finishing a logical unit.
4. Commit + push.
5. Only escalate live credentials or irreversible destructive actions.

Contact
- Repo: https://github.com/pabyngono-claw/pharmaconnect
- Default provider: nous (NVIDIA NIM + OpenRouter auto-fallback)
