# Navigation Architecture

## Member Client (Web PWA)

Five primary destinations. Discovery is the default landing page.

| Tab/Nav Item | Route | Purpose | Priority |
|---|---|---|---|
| **Discover** (default) | `/discover` | Search and browse listings and providers | P0 |
| **Orders** | `/orders` | Active and past orders (client + provider) | P0 |
| **Messages** | `/messages` | 1:1 conversations | P0 |
| **Feed** | `/feed` | Work-related content feed | P1 |
| **Profile** | `/profile` | Own profile, portfolio, settings | P0 |

Persistent **notification bell** in the header with unread count badge.

## Admin Dashboard

| Nav Item | Route | Priority |
|---|---|---|
| **Dashboard** | `/admin` | P0 |
| **Members** | `/admin/members` | P0 |
| **Orders** | `/admin/orders` | P0 |
| **Disputes** | `/admin/disputes` | P0 |
| **Finance** | `/admin/finance` | P0 |
| **Moderation** | `/admin/moderation` | P1 |
| **Settings** | `/admin/settings` | P0 |
| **Audit Log** | `/admin/audit` | P2 |
