repo: dnd288/mezon-llm-portal
branch: main

## Last sync

date: 2026-09-10T12:39:34Z

### Updated in this project

- Created "Mezon LLM Portal.dc.html" — design system + all portal screens (dark/light).
- Imported brand marks: icon, horizontal lockup and full lockup from `public/`.
- Pricing cards enriched (nhóm truy cập, uptime/latency/TPS, trạng thái Ổn định/Chập chờn/Lỗi); đơn vị giá đổi sang mzđ.
- Palette and type grounded in `src/app/globals.css` + Geist from `src/app/layout.tsx`.

## Screen map

| Project screen | Repo files |
|---|---|
| Foundations / Component kit | src/app/globals.css, src/app/layout.tsx |
| Landing | src/app/page.tsx |
| Dashboard | src/app/(portal)/dashboard/page.tsx, src/app/(portal)/layout.tsx, src/components/voucher-dialog.tsx |
| API Keys + create dialog | src/app/(portal)/tokens/page.tsx, src/components/create-token-dialog.tsx |
| Usage logs | src/app/(portal)/logs/page.tsx |
| Vouchers | src/app/(portal)/vouchers/page.tsx |
| Pricing / Models | src/app/models/page.tsx |
| Login | src/app/login/page.tsx |
| Mobile | src/components/mobile-nav.tsx |
