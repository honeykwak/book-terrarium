# Implementation Plan - Final Polish Enhancements

## Goal Description
Implement three key enhancements to polish the "Book Terrarium" project for final submission:
1.  **Unit Testing**: Add `Vitest` and basic tests for `ReadingCalendar` to demonstrate technical maturity.
2.  **UI Polish**: Replace native browser tooltips in `ReadingCalendar` with custom Tailwind CSS tooltips.
3.  **SEO/UX**: Implement dynamic page titles using `react-helmet-async`.

## User Review Required
> [!IMPORTANT]
> **Supabase Connection Issue**: The error `DNS_PROBE_FINISHED_NXDOMAIN` indicates your Supabase project has likely been **paused** due to inactivity (common on the Free Tier).
> **Action Required**: Please log in to the Supabase Dashboard and click "Restore Project". It may take a few minutes to wake up.
> While you do that, I will proceed with the code changes below, which don't strictly require the DB to be active immediately.

## Proposed Changes

### 1. Unit Testing (Vitest)
#### [NEW] [vitest.config.ts](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/vitest.config.ts)
- Configure Vitest for React testing (using jsdom).

#### [NEW] [components/ReadingCalendar.test.tsx](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/components/ReadingCalendar.test.tsx)
- Add tests to verify:
    - Renders without crashing.
    - Correctly renders colored blocks based on activity data.
    - Handles empty data gracefully.

#### [MODIFY] [package.json](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/package.json)
- Add scripts: `"test": "vitest"`
- Add devDependencies: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.

### 2. UI Polish (Custom Tooltips)
#### [MODIFY] [components/ReadingCalendar.tsx](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/components/ReadingCalendar.tsx)
- Remove `title` attribute.
- Add a child `div` or `span` with `group-hover` classes to display a styled tooltip (Sage green background, white text, rounded corners).

### 3. Dynamic Titles (React Helmet)
#### [MODIFY] [App.tsx](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/App.tsx)
- Wrap the app with `HelmetProvider`.
- Add a default `<Helmet>` with the base title.

#### [MODIFY] [components/Onboarding.tsx](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/components/Onboarding.tsx)
- Add `<Helmet>` to change title to "온보딩 | 북 테라리움".

#### [MODIFY] [components/InputArea.tsx](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/components/InputArea.tsx)
- Add `<Helmet>` to reflect the current chat context (if applicable) or "채팅 | 북 테라리움".

#### [MODIFY] [components/MyPageModal.tsx](file:///Users/honeykwak/Desktop/ME/5-1/final_project/PWD_v0.2/components/MyPageModal.tsx)
- Add `<Helmet>` to change title to "마이페이지 | [사용자명]".

## Verification Plan

### Automated Tests
- Run `npm run test` to execute the new Vitest suite.

### Manual Verification
1.  **Supabase Restoration**: Verify the app loads without DNS errors (User action required).
2.  **Tooltips**: Hover over the reading calendar squares. Expect a styled green tooltip instead of the browser default.
3.  **Titles**:
    - Open the app -> Tab should say "북 테라리움".
    - Open My Page -> Tab should change to "마이페이지 | [이름]".
    - Close My Page -> Tab should revert.
