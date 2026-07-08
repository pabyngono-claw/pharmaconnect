# Go/No-Go Release Checklist — PharmaConnect v2.0

Use this before Alpha, Beta, and Production release.

## Alpha - interne
- [ ] Schema Xano importe et seed applique
- [ ] 21 tables presentes et indexes valides
- [ ] TC-01..TC-12 executes au moins en mode manuel
- [ ] Worker dev accessible: /health retourne  ok
- [ ] Webhook Orange Money vs Wave testes en idempotency
- [ ] FlutterFlow web build importe dans Worker
- [ ] Auth OTP + OAuth fonctionne pour 1 compte patient + 1 pharmacie + 1 admin
- [ ] Push notification re├зue sur appareil reel
- [ ] Prescription upload + compression c├┤te client OK
- [ ] TVA calculee c├┤te serveur confrontee au front
- [ ] Idempotency header teste sur reservation + document + payment

## Beta - restreint
- [ ] 3 pharmacies reelles ont uploade leurs documents
- [ ] Flux demande->reservation->retrait joue de bout en bout
- [ ] Scheduler jobs executes sans erreur
- [ ] Monitoring: Workers Analytics enabled
- [ ] Xano logs verified on payment webhook and OTP flows
- [ ] 3 patients ont cree des demandes et confirme retrait
- [ ] Support email et SLO defini
- [ ] Rollback valide: restauration Worker + schema Xano en moins de 15 min

## Production
- [ ] Secrets GitHub Actions configures et rotes
- [ ] Cloudflare custom domain actif et SSL OK
- [ ] Store listings completes (Play Store + App Store)
- [ ] Politique confidentialite + CGU en ligne
- [ ] Plan de maintenance scheduler jobs documente
- [ ] Plan de backup Xano automatise
- [ ] Release notes redigees
- [ ] Incident response runbook valide
