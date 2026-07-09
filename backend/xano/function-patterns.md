# Xano Function Implementation Patterns — PharmaConnect v2.0

Common patterns to reuse across API Groups.
These are copy-pasteable pseudocode/JS blocks for Xano Functions.

## Auth gate
Use on every protected route except public auth endpoints.

```
if (!context.user) {
  return response(401, { message: "Unauthorized" });
}
```

## Pharmacy gate
```
if (context.user.role !== "pharmacy") {
  return response(403, { message: "Forbidden" });
}
const pharmacyId = context.user.pharmacy_id;
```

## Admin gate
```
if (context.user.role !== "admin") {
  return response(403, { message: "Forbidden" });
}
```

## Geo query pattern
```
const lat = parseFloat(input.lat);
const lng = parseFloat(input.lng);
const radiusKm = input.radius || 25;
const sql = `
  SELECT *, (6371 * acos(cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(lat)))) AS distance_km
  FROM pharmacies
  WHERE active = true
  HAVING distance_km <= :radiusKm
  ORDER BY distance_km ASC
  LIMIT :limit OFFSET :offset
`;
return db.query(sql, { lat, lng, radiusKm, limit: 50, offset: 0 });
```

## Idempotency guard
```
const idempotencyKey = request.headers["idempotency-key"];
if (!idempotencyKey) {
  return response(400, { message: "Missing idempotency-key" });
}
const existing = db.query_one("SELECT id FROM reservations WHERE idempotency_key = :k", { k: idempotencyKey });
if (existing) {
  return response(200, existing);
}
```

## Audit log insert
```
db.insert("audit_logs", {
  actor_user_id: context.user.user_id,
  action: "reservation.created",
  entity_type: "reservations",
  entity_id: reservation.id,
  ip: request.ip,
  user_agent: request.headers["user-agent"],
  metadata: { request_id: input.request_id },
});
```

## TVA compute
```
const tvaRate = 0.18;
const ht = parseFloat(input.unit_price) * parseInt(input.quantity);
const ttc = ht * (1 + tvaRate);
return { ht, tva: ht * tvaRate, ttc };
```

## Document approval state transition
```
const doc = db.query_one("SELECT * FROM pharmacy_documents WHERE id = :id", { id });
if (!doc) return response(404, { message: "Document not found" });
const next = input.approved ? "approved" : "rejected";
if (doc.status !== "pending") return response(409, { message: "Already processed" });
db.update("pharmacy_documents", doc.id, { status: next, reviewed_at: now(), reviewed_by: context.user.user_id });
checkPharmacyApprovalStatus(doc.pharmacy_id);
```

## Webhook signature validation (optional)
```
const secret = env.WEBHOOK_PROVIDER_SECRETS[input.provider];
const expected = hmac_sha256(secret, request.body);
if (expected !== input.signature) {
  return response(401, { message: "Invalid signature" });
}
```

## Error envelope helper
```
return response(400, { error: "validation_error", details: ["field x required"], code: 400 });
```
