# O'Food Korea Journey Passport Prototype v3

Editable Vite prototype for the O'Food Seaweed mini app. V3 is the finished-app build, copied from v2 and elevated through Impeccable passes. V2 and v1 remain preserved as backup references; mechanics, information architecture, and the 3-tab navigation are unchanged (craft-only scope).

## v3 Finish Passes (Impeccable)

- **layout + bolder**: 4pt spacing scale and a semantic z-index scale; brand-owned, self-contained camera hero (replaced the remote Unsplash photo, so the hero is offline-safe for the pitch); confident display type with rebalanced body weight (500) for real hierarchy.
- **animate**: per-screen entrance settle (gated to view changes, never on in-place re-renders), capped list stagger, meter grow, balance count-up, QR capture flash, button/nav press feedback, notice slide-in. Every motion has a `prefers-reduced-motion` fallback.
- **delight**: gentle brand-colored celebration on real wins (rare Korea travel voucher, Hành Trang reward unlock, full weekly Lộc), warm teaching empty states, reassurance copy. Tuned to a light family ritual, not casino energy.
- **overdrive (Vòng Quay)**: the lucky-draw wheel spins 6-8 cycles over ~3.4s, driven by the Web Animations API with an anticipation wind-up and a hard ease-out-expo so it rockets then creeps the last half-turn to the result. Motion blur peaks during the fast phase and clears as it slows, the pointer ticks like pegs and dampens, an energy glow pulses, and the centre lands with a pulse. The result fires exactly on settle; reduced motion skips straight to the outcome. Also fixed: button taps no longer jump the scroll to the top (scroll position is preserved across in-place re-renders).

## Current Direction

- Default screen: `Quét QR`, shown as an active camera-style scanner.
- Main draw: `01` valid O'Food pack QR scan gives `01` `Vòng Quay May Mắn`.
- Main draw prize pool: weekly Korea travel voucher prize, or common `01-05 Bưu thiếp hành trình`.
- Hành Trang gate: `10 Bưu thiếp = 01 Vòng Quay Hành Trang`.
- Retention CTA: `Tích lộc món ngon`, giving `01 Lộc` per daily login, up to `05 Lộc` per week.
- Weekday voucher gate: `02 Lộc` accumulated in the week unlocks `01 Vòng Quay Voucher Trong Tuần`.
- Weekend voucher gate: `05 Lộc` accumulated in the week unlocks `01 Vòng Quay Voucher Cuối Tuần`.
- Voucher reward: `Voucher WinMart`, redeemed through mocked WinX install, account-link, and point-transfer steps.
- Memory hub: `Passport của tôi`, holding Lộc recipe moments, reward history, voucher wallet, and UGC submission. `Bưu thiếp` is only used for Hành Trang.

## Design Direction

- Typography: Baloo 2 headings, Nunito body.
- Icon source direction: StreamlineHQ Flex Flat Free duotone icons, locally cached as SVGs and recolored into the Design.md role palettes for functional controls.
- Frame source direction: custom scalable SVG object frames for wheels, Passport canvas, vouchers, and postcards.
- Illustration source direction: generated or bespoke 2D assets for expressive moments such as QR pack, food-luck character, postcard places, and travel rewards.
- Style: breathable pastel mobile UI, 2D semi-skeuomorphic objects, large primary actions, and minimal history rows.
- Interaction: visible copy supports double-click editing with local persistence.

## Reviewer Controls

Open the `Demo` drawer to test:

- Weekday or weekend mode.
- Active `Bưu thiếp` presets: 0, 9, 10, 19.
- Active `Lộc` presets: 0, 1, 2, 5.
- Forced Main draw results: +1, +3, +5 `Bưu thiếp`, travel voucher, or random.
- WinX state: no install, installed, or linked.
- Demo reset.

## Live demo

[blinkpham.github.io/ofood-korea-journey-passport](https://blinkpham.github.io/ofood-korea-journey-passport/) (auto-deployed from `main` via GitHub Pages).

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Scope

This is a high-fidelity static prototype with mocked state. It includes no real QR camera, WinMart, WinX, Zalo, account, legal odds, voucher, or UGC API integration.
