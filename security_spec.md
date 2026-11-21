# Saubhagya Emporium — Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any collection not explicitly matched is denied for all reads and writes.
2. **Owner & Verified Staff Gate**: Only the bootstrapped store owner (`kunalkadu9518958@gmail.com` with `email_verified == true`) or an authorized editor in `/admins/{request.auth.uid}` (with `email_verified == true`) can create, update, or delete `/store_config/main` or `/products/{productId}`.
3. **Strict Path IDs**: All document IDs (`configId`, `productId`, `adminUid`, `inviteCode`) must match `^[a-zA-Z0-9_\\-]+$` and stay within `<= 128` characters.
4. **Immutable Authorship & Temporal Integrity**: `createdAt` is immutable on `/products` and must equal `request.time` on creation; `updatedAt` must equal `request.time` on updates; `updatedByUid` must always equal `request.auth.uid`.
5. **No Self-Promotion**: Users cannot create `/admins/{uid}` with `role: 'owner'` or without atomically claiming an `active == true` `/editor_invites/{inviteCode}` document in the same batch (`existsAfter` / `getAfter`).
6. **PII Isolation**: `/admins/{adminUid}` contains verified email addresses and display names; `get` is strictly restricted to the matching user (`request.auth.uid == adminUid`) or the bootstrapped owner, and `list` is strictly restricted to the bootstrapped owner.
7. **Invite Privacy**: `/editor_invites/{inviteCode}` forbids `list` for non-owners so uninvited users cannot enumerate valid codes.
8. **Query Enforcement**: Public `allow list` on `/products` strictly enforces `resource.data.published == true` without using `get()` or `exists()`.

## 2. "Dirty Dozen" Attack Payloads (Must All Return `PERMISSION_DENIED`)
1. **Unauthenticated Product Create**: Unauthenticated user calls `setDoc(doc(db, 'products', 'p1'), { ...validProduct })`.
2. **Unverified Email Spoof**: Signed-in user with `email_verified: false` (even with owner email) attempts `updateDoc(doc(db, 'store_config', 'main'), ...)`.
3. **Random Signed-In Customer Product Edit**: Authenticated customer (not in `/admins` and not owner) attempts `updateDoc(doc(db, 'products', 'se-mens-01'), { priceInr: 1 })`.
4. **Shadow Field Injection on Product**: Authorized editor sends `{ ...validProduct, isAdminOverride: true }`.
5. **Self-Assigned Admin Without Invite**: Random signed-in user attempts `setDoc(doc(db, 'admins', myUid), { uid: myUid, role: 'editor', inviteCode: 'FAKE123', ... })`.
6. **Admin Role Escalation**: User attempts to set `role: 'owner'` inside `/admins/{myUid}` during claim.
7. **Replaying Used Invite Code**: User attempts to claim an invite where `active == false` or without atomically setting `active: false` and `usedByUid == request.auth.uid` on `/editor_invites/{inviteCode}`.
8. **UID Spoofing in `updatedByUid`**: Authorized editor sets `updatedByUid: 'someone_else_uid'` when updating a product.
9. **Client-Forged Timestamp**: Authorized editor sets `updatedAt: new Date('2020-01-01')` instead of `serverTimestamp()`.
10. **ID Poisoning / Oversized Payload**: Editor tries to create `/products/{1500_char_id}` or a product `description` > 300 chars or negative `priceInr: -500`.
11. **PII Blanket Read on `/admins`**: Non-owner signed-in user attempts `getDocs(collection(db, 'admins'))` or `getDoc(doc(db, 'admins', 'other_uid'))`.
12. **Invite Code Enumeration**: Non-owner signed-in user attempts `getDocs(collection(db, 'editor_invites'))`.
