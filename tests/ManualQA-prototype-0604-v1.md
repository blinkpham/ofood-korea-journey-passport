# Manual QA - Korea Journey Passport Prototype

## Build

- [ ] `npm run build` completes.
- [ ] App loads at the local Vite URL.
- [ ] No stale visible terms from retired mechanics appear.

## Mechanics

- [ ] Default view is `Quét QR`.
- [ ] Scanner copy says the QR is inside the O'Food pack.
- [ ] Tapping the scanner opens `Vòng Quay May Mắn`.
- [ ] Forced Main draw `+1`, `+3`, and `+5` add the correct active `Bưu thiếp` amount.
- [ ] Main draw can show the weekly Korea travel voucher prize.
- [ ] Main draw result CTA goes to `Hành trang` when active `Bưu thiếp` reaches 15.
- [ ] `14/15` active `Bưu thiếp` blocks Hành Trang and shows the missing amount.
- [ ] `15/15` active `Bưu thiếp` unlocks `Vòng Quay Hành Trang`.
- [ ] Hành Trang spin deducts 15 active `Bưu thiếp`.
- [ ] Collected postcards remain visible in `Passport của tôi` after spending.
- [ ] Daily `Tích lộc món ngon` gives exactly `01 Lộc`.
- [ ] Weekend mode keeps daily login at exactly `01 Lộc`.
- [ ] `02 Lộc` unlocks weekday voucher spin.
- [ ] `05 Lộc` unlocks weekend voucher spin.
- [ ] Weekday voucher outcomes are 5%, 10%, 15%, and 20%.
- [ ] Weekend voucher outcomes are 10%, 20%, 30%, and 40%.
- [ ] Multiple `Voucher WinMart` rewards can be held at once.

## WinX Flow

- [ ] Voucher info opens the WinX redemption guide.
- [ ] When WinX is missing, the guide prompts install and registration.
- [ ] Returning from install advances to account linking.
- [ ] Linked state allows point transfer.
- [ ] Transferred voucher state updates in the Passport wallet.

## Passport And UGC

- [ ] `Passport của tôi` shows Mom profile, UserID chip, and settings/edit affordances.
- [ ] Passport filters include `Tất cả`, `Bưu thiếp`, `Lộc`, `Hành trang`, `Voucher`, and `UGC`.
- [ ] UGC prompt explains the TikTok challenge participation route.
- [ ] TikTok URL submission accepts a TikTok link and creates a submitted UGC item.
- [ ] Non-TikTok URL submission shows a local validation message.

## Navigation And Layout

- [ ] Bottom navigation has `Hành trang`, raised `Quét QR`, `Tích lộc`, and `Passport`.
- [ ] Map drawer opens and routes to key functions using natural-language Vietnamese prompts.
- [ ] Formula strips appear near the top of mechanic screens.
- [ ] Scroll fade spans the screen width above the bottom nav.
- [ ] No overlapping toast covers important text.
- [ ] Buttons are large enough and do not create squished columns.
- [ ] All visible copy remains double-click editable and persists after refresh.
