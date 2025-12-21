# Advanced Account Deletion Logic

- [ ] **Analyze Implementation** <!-- id: 0 -->
    - [ ] `components/MyPageModal.tsx`: Review `handleDeleteAccount` UI and logic. <!-- id: 1 -->
    - [ ] `services/dbService.ts`: Review `deleteUser` and DB logic. <!-- id: 2 -->
- [x] **Implement Logic** <!-- id: 3 -->
    - [x] **Frontend**: Add "Delete all activity" checkbox to confirmation dialog in `MyPageModal.tsx`. <!-- id: 4 -->
    - [x] **Backend**: Implement `hardDeleteUser` (or modify `deleteUser`) to handle cascading deletion of profile, sessions, and messages if requested. <!-- id: 5 -->
    - [x] **Safety**: Ensure "Soft Delete" keeps data but allows re-login (or just sign out). <!-- id: 6 -->
- [x] **Verification** <!-- id: 7 -->
    - [x] Verify both flows (Check vs Uncheck). <!-- id: 8 -->
