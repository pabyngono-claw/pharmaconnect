# PharmaConnect Frontend Error Glossary

Use this to map backend errors to friendly French messages in FlutterFlow.
Localize in the app, not in the backend.

| Status | Error code or signal | Front message (fr) | Action utilisateur |
|---|---|---|---|
| 400 | `missing_phone` | Veuillez fournir un num├йro de t├йl├йphone. | Corriger le champ phone. |
| 400 | `invalid_phone` | Format de num├йro invalide. | Utiliser +221XXXXXXXXX. |
| 429 | `otp_rate_limited` | Trop de demandes. Reessayez dans %s secondes. | Attendre cooldown. |
| 401 | `invalid_otp` | Code incorrect. | Resaisir le code. |
| 401 | `expired_token` | Session expiree. | Se reconnecter. |
| 403 | `not_a_pharmacy` | Acc├иs r├йserv├й aux pharmacies. | Utiliser le compte pharmacie. |
| 403 | `not_an_admin` | Droits administrateur requis. | Utiliser un compte admin. |
| 404 | `request_not_found` | Demande introuvable. | Rafraichir la liste. |
| 409 | `reservation_conflict` | Ce stock vient d'etre reserve. | Choisir une autre pharmacie. |
| 409 | `duplicate_webhook` | Webhook dej├а trait├й. | Ne pas renvoyer. |
| 422 | `document_invalid` | Document non conforme. | Verifier type et taille. |
| 422 | `subscription_past_due` | Abonnement en retard. | Mettre ├а jour le paiement. |
| 500 | `xano_unavailable` | Service temporairement indisponible. | Reessayer dans 1-2 min. |
| 502 | `worker_bad_gateway` | Probleme de connexion. | Reessayer dans 1-2 min. |

## Message g├йn├йriques
- Erreur r├йseau : "Impossible de joindre le service. Verifiez votre connexion."
- Timeout : "Le delai est depasse. Veuillez reessayer."
- Payload refus├й : "Donnees invalides. Corrigez et reessayez."