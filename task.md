# Advanced Account Deletion Logic

- [ ] **Analyze Implementation** <!-- id: 0 -->
    - [ ] `components/MyPageModal.tsx`: Review `handleDeleteAccount` UI and logic. <!-- id: 1 -->
    - [ ] `services/dbService.ts`: Review `deleteUser` and DB logic. <!-- id: 2 -->
- [ ] **Implement Logic** <!-- id: 3 -->
    - [ ] **Frontend**: Add "Delete all activity" checkbox to confirmation dialog in `MyPageModal.tsx`. <!-- id: 4 -->
    - [ ] **Backend**: Implement `hardDeleteUser` (or modify `deleteUser`) to handle cascading deletion of profile, sessions, and messages if requested. <!-- id: 5 -->
    - [ ] **Safety**: Ensure "Soft Delete" keeps data but allows re-login (or just sign out). <!-- id: 6 -->
- [ ] **Verification** <!-- id: 7 -->
    - [ ] Verify both flows (Check vs Uncheck). <!-- id: 8 -->
