# Implementation Plan - Match & Trade UI/UX Updates

This plan details the changes required to satisfy all 6 UI/UX requests for the **Match & Trade** feature.

## Proposed Changes

---

### Component: Sidebar navigation & stats display
We will update the sidebar navigation element to show the feature stats directly and mark it as "HOT" rather than "COMING SOON".

#### [MODIFY] [Sidebar.tsx](file:///d:/Github%20Repositories/REVORA_FE/src/components/common/Sidebar.tsx)
- Replace the `COMING SOON` text with a `HOT` badge.
- When `isOpen` is true, render the stats `982 người đang tham gia` and `2.516 sản phẩm chờ trao đổi` directly underneath the `REVORA MATCH` link.

---

### Component: Select Products (Step 1)
We will introduce pagination to the "Chọn Sản Phẩm Trao Đổi" screen to prevent the grid list from becoming excessively long.

#### [MODIFY] [RevoraMatchPage.tsx](file:///d:/Github%20Repositories/REVORA_FE/src/pages/Features/RevoraMatchPage.tsx)
- Define `ITEMS_PER_PAGE = 6`.
- Add local state `currentPage` starting at `1`.
- Compute `paginatedProducts` using a `useMemo` block.
- Render clean navigation buttons ("Trước", "Sau") and page indicator at the bottom of the grid.
- Reset `currentPage` to `1` when switching to the `select-products` step.

---

### Component: Match Conditions (Step 2)
We will align the filters side-by-side on desktop layouts and stacked on mobile devices to optimize space.

#### [MODIFY] [RevoraMatchPage.tsx](file:///d:/Github%20Repositories/REVORA_FE/src/pages/Features/RevoraMatchPage.tsx)
- Wrap the Price Bucket and City filter lists in a responsive 2-column grid container (`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8`).

---

### Component: Removing Demo & Sample labels
We will clean up the UI by removing any mention of dummy, demo, or sample data.

#### [MODIFY] [RevoraMatchPage.tsx](file:///d:/Github%20Repositories/REVORA_FE/src/pages/Features/RevoraMatchPage.tsx)
- Remove the "Dữ liệu mẫu" absolute badge on cards.
- Remove the preview notification text regarding dummy seed data.
- Modify notice texts to say "Đã gửi thông báo quan tâm" instead of mentioning bot data.

#### [MODIFY] [SeedData.cs](file:///d:/Github%20Repositories/REVORA_BE/REVORA_BE/Data/SeedData.cs)
- Strip the `[Mẫu]` prefix from the seeded product titles.
- Change the `Sản phẩm demo Match & Trade` description of the mock products to realistic item descriptions.
- Change bot product titles to "Sản phẩm trao đổi" rather than "Sản phẩm demo".

---

### Component: Searching Loader and Finished States (Step 3/4)
We will improve the match state logic so that the searching animation is shown only when initially looking for matches. Once the cards run out, it will only display the "Thay đổi bộ lọc" button.

#### [MODIFY] [RevoraMatchPage.tsx](file:///d:/Github%20Repositories/REVORA_FE/src/pages/Features/RevoraMatchPage.tsx)
- Track state `hasSwipedAtLeastOnce` (boolean, defaults to `false`).
- Reset it to `false` when a match session starts.
- Set it to `true` when a swipe action (like/pass) is performed.
- In the card slot's fallback container:
  - If `isSwipeLoading` is `true`, render the searching radar spinner with the "Đang tìm kiếm sản phẩm phù hợp..." text.
  - If loading is finished and card is null, display either "Đã hết sản phẩm phù hợp" or "Không tìm thấy sản phẩm phù hợp", along with a single button: "Thay Đổi Bộ Lọc" (removing the "Tìm Kiếm Lại" button and the pulsing radar).

---

### Component: Side Buttons Layout & Swipe Animations (Step 3/4)
We will move the Pass and Heart buttons to the left and right sides of the screen (layout matching web standards) and add visual drag feedback and flying card animation.

#### [MODIFY] [RevoraMatchPage.tsx](file:///d:/Github%20Repositories/REVORA_FE/src/pages/Features/RevoraMatchPage.tsx)
- Arrange layout into three columns (Pass Button on left, Card Deck in middle, Heart Button on right) on md+ screens.
- Add spring scale effects on side buttons when the card is dragged close to their respective side.
- Wrap the swipe card in `<AnimatePresence mode="popLayout" custom={exitDirection}>`.
- Set state `exitDirection` ('left' or 'right') immediately upon swiping and set `currentSwipeCard(null)` to trigger the instant exit animation.
- Configure `exit={(dir) => ({ x: dir === 'right' ? 600 : -600, y: 150, scale: 0.1, opacity: 0 })}` on the card's `motion.div`.

## Verification Plan

### Automated Tests
- Run `npm run build` on the FE codebase to ensure it compiles correctly without TypeScript or layout errors.

### Manual Verification
- Navigate to the dashboard, verify the side navigation features stats and "HOT" label.
- Click "Bắt Đầu Match & Trade", verify page layout for step 1, select products and verify pagination buttons work.
- Proceed to Step 2, check that filters are side-by-side.
- Start matching, verify the radar animation shows during the first fetch, then cards render without "Dữ liệu mẫu" labels.
- Drag left/right, check button hover/glow reactions, let go or click buttons, verify cards fly to the side icons.
- Swipe all cards to the end, verify it shows "Đã hết sản phẩm phù hợp" with only a "Thay Đổi Bộ Lọc" button.
