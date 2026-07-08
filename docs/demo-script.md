# Demo Script and Acceptance Criteria — PharmaConnect v2.0

Use this for stakeholder demos or internal acceptance testing.
All steps are verbalizable in 30-40 minutes with a prepared demo environment.

## Demo scenario: Pharmacie Saint Michel recoit 2 demandes et confirme 1 reservation

1. Patient Aoua cree une demande de Doliprane 1000mg.
   - Expected: ecran confirmation avec ID demande et badge "Soumis".
2. Pharmacie Saint Michel recoit la demande dans son dashboard.
   - Expected: notification + entree dans la file d attente.
3. Pharmacie Saint Michel confirme une reservation de 2 boites.
   - Expected: reservation passee en "Reserve" avec horodatage.
4. Patient recoit notification "Votre reservation est prete".
   - Expected: push recue en < 30s.
5. Patient confirme le retrait.
   - Expected: statut passe en "Servi".
6. Admin approuve le document Kbis de Pharmacie Saint Michel.
   - Expected: statut pharmacie passe en "Approuvee".
7. Repetition webhook Orange Money envoi 2 fois meme transaction_id.
   - Expected: deuxieme appel retourne meme transaction_id sans doublon.

## Acceptance criteria
- E2E fini sans erreur 500 non geree.
- duree totale inferieure a 2min en environnement seed.
- TVA calculee cote serveur dans la facture affichee.
- Aucun token ou secret stocke dans FlutterFlow.
