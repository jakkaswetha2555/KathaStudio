# Katha Studio

Katha Studio is a small art storefront and studio-service booking site. Customers can browse and order art products, book wall painting, and request custom pottery. An authenticated admin dashboard manages product listings, orders, wall bookings, and pottery requests.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Firebase setup](#firebase-setup)
- [Admin access](#admin-access)
- [Firestore data](#firestore-data)
- [Seed service prices](#seed-service-prices)
- [Important behavior and limitations](#important-behavior-and-limitations)
- [Troubleshooting](#troubleshooting)

<img width="1886" height="1083" alt="image" src="https://github.com/user-attachments/assets/ed005da0-0d93-48db-8f20-59a7cd59c9ca" />
<img width="1902" height="1088" alt="image" src="https://github.com/user-attachments/assets/3a453188-29a6-49c2-88d2-8b6fccb44f2f" />
<img width="1656" height="1198" alt="image" src="https://github.com/user-attachments/assets/d6297bdc-19c0-4a70-a84f-6fa5d39715c3" />

## Features

### Customer storefront

- Responsive art storefront with product search, category filters, sorting, product cards, and motion effects.
- Google sign-in through Firebase Authentication.
- Cart is available to signed-in customers and stored separately for each account.
- Checkout collects and saves a delivery address to the customer's account.
- Orders are saved to the customer's account and shown under **Account → My orders**.
- Customers can cancel an order while it is still `placed`.
- Studio services:
  - **Wall painting:** choose a date 7–90 days in advance, enter a wall size from 10–500 sq ft, and provide the service address. The estimate is wall size × ₹18 per sq ft. A date can have only one booking across the studio. The customer can cancel a requested or confirmed booking through three days before its date.
  - **Custom pottery:** choose one of seven seeded item/glaze combinations, quantity 1–12, and a needed-by date at least 14 days away. The estimate is unit price × quantity. A customer may edit or cancel a request only while its status is `requested`.
- Customers can view their wall bookings and pottery requests under **Account → My studio requests**.

### Admin dashboard

Open `admin.html` after signing in with an account whose Firebase Authentication custom claims include `admin: true`.

- View and search customer orders, including items, contact information, and delivery address.
- Cancel orders that are still `placed`.
- Add products with a name, price, category, badge, description, and public HTTPS image URL; delete Firestore-backed products.
- Review wall bookings and confirm or decline requests. Declining a booking releases the date.
- Review pottery requests and accept or decline them.
- Customer information and service-request information are shown only to an authorized admin or to the customer who owns the record.

## Technology

- HTML5, CSS, and browser JavaScript (no frontend build step).
- Firebase JavaScript SDK 13.1.0, loaded as ES modules from Google's CDN.
- Firebase Authentication with Google sign-in.
- Cloud Firestore for product records, customer carts, saved addresses, orders, bookings, date reservations, and pottery requests.
- No Firebase Storage is required. Product images use public HTTPS image URLs.
- `service-seeds.js` contains the wall-painting rate and pottery options used by the browser UI.

## Requirements

- A modern browser with internet access.
- Python 3 (or another static HTTP server) to serve the site locally. Opening the HTML files directly with `file://` is not supported because the site loads JavaScript modules and Firebase.
- A Firebase project configured for the web app. The current pages are configured for project `katha-studio-39437`.
- Cloud Firestore enabled and the rules in [`firestore.rules`](./firestore.rules) published.
- Firebase Authentication enabled with the Google provider, and `localhost` added to the authorized domains for local testing.
- A custom `admin: true` claim for the admin account to use admin-only features.

Firebase Storage is deliberately not used or required.

## Run locally

Open PowerShell in the website folder:

```powershell
Set-Location "C:\Users\Swetha jakka\OneDrive\Desktop\website"
python -m http.server 4156
```

If `python` is not recognized, try:

```powershell
py -m http.server 4156
```

Keep that PowerShell window open while using the site. Open:

- Customer storefront: <http://localhost:4156/index.html>
- Admin dashboard: <http://localhost:4156/admin.html>

Stop the local server with **Ctrl+C** in its PowerShell window.

## Firebase setup

1. In Firebase Console, open project `katha-studio-39437`.
2. Enable **Authentication → Google** and add `localhost` under the authorized domains.
3. Create or enable the Cloud Firestore database.
4. Open **Firestore Database → Rules**, replace the rules with the contents of [`firestore.rules`](./firestore.rules), and click **Publish**. These rules include the owner-only account data rules and admin-only product and service-management permissions.
5. Open **Firestore Database → Indexes**. The admin order history uses a collection-group query ordered by `createdAt` descending. If Firestore reports a missing index, follow the link in that error, create the requested index, and wait until it is enabled.

Do not add open/test rules such as `allow read, write: if true`. The rules intentionally require authentication and the admin custom claim for privileged operations.

### Admin custom claim

Firestore rules do not grant the admin claim. It must be set by a trusted Firebase Admin SDK process.

If a claim needs to be granted or revoked:

1. Keep the service-account JSON key **outside** the website folder and never upload or share it.
2. Use a private tools folder with Node.js and the `firebase-admin` package installed.
3. Run the grant script from that private folder after setting `GOOGLE_APPLICATION_CREDENTIALS` to the actual key path. The script sets `admin: true` for `jakkaswetha2555@gmail.com`; review the email in [`grant-admin.cjs`](./grant-admin.cjs) before using it.
4. After a claim change, sign out and sign back in to refresh the user's ID token.

The website's `start-admin-panel.ps1` is a claim-grant helper, **not** the command for starting the static website. Review its credential path and keep credentials private before running it.

## Firestore data

| Path | Purpose | Access |
| --- | --- | --- |
| `products/{productId}` | Products created from the admin page | Public read; admin create, update, and delete |
| `users/{uid}/private/cart` | Signed-in customer's cart | Owning customer |
| `users/{uid}/private/profile` | Saved checkout address | Owning customer |
| `users/{uid}/orders/{orderId}` | Customer orders | Customer owner and admin may read; customer may cancel a placed order |
| `wallAvailability/{YYYY-MM-DD}` | Unique reservation for a wall-painting date | Used to prevent two bookings for the same date |
| `users/{uid}/wallBookings/{YYYY-MM-DD}` | Customer wall-painting booking | Customer owner and admin may read; owner may cancel before the cutoff; admin may confirm or decline |
| `users/{uid}/potteryRequests/{requestId}` | Customer custom-pottery request | Customer owner and admin may read; owner may edit or cancel while requested; admin may accept or decline |

The browser validates form values for usability; Firestore rules also validate sensitive limits and permitted state transitions. Admin reads across customer subcollections use collection-group queries.

## Seed service prices

The current seed data is in [`service-seeds.js`](./service-seeds.js):

- Wall painting: **₹18 per sq ft**.
- Kulhad cup — Sea glass: ₹480 each.
- Kulhad cup — Marigold: ₹480 each.
- Tea bowl — Lotus pink: ₹720 each.
- Tea bowl — Forest green: ₹720 each.
- Mini planter — Sandy white: ₹950 each.
- Bud vase — Cobalt blue: ₹1,450 each.
- Diya — Terracotta red: ₹350 each.

To change these values, update both the seed data and the matching validation values in [`firestore.rules`](./firestore.rules), then republish the rules. Existing requests keep the price and item details recorded at the time of submission.

## Important behavior and limitations

- Booking uniqueness is per calendar date for the entire studio, not per customer.
- The booking date is reserved when the customer submits a request. If the studio declines it, the date reservation is released. Customer cancellation also releases it.
- A wall booking can be cancelled until the three-day cutoff; it cannot be cancelled after that cutoff.
- Pottery status flow: `requested` → `accepted`, `declined`, or customer-cancelled. A request can be edited only while `requested`.
- Wall booking status flow: `requested` → `confirmed`, `declined`, or customer-cancelled.
- Order status flow: `placed` → `cancelled` by the customer or admin.
- Payments, refunds, delivery tracking, and automated email notifications are not implemented.
- Images added through the admin must be publicly accessible HTTPS image URLs. Some hosting providers' share-page URLs are not direct image URLs and may not render.
- The included admin product list manages products stored in Firestore. The original sample storefront products remain hardcoded in `index.html`.
- All service-date comparisons use the browser's local calendar date; the studio currently has no separate timezone or opening-hours configuration.

## Troubleshooting

- **Google sign-in says the domain is unauthorized:** add `localhost` under Firebase Authentication authorized domains.
- **Firestore says permission denied:** confirm the current `firestore.rules` were published, the user is signed in, and admin actions use a token with the `admin: true` claim.
- **Admin page says the admin claim is missing:** sign out and back in after granting the claim; check the claim in the Firebase ID token if needed.
- **Orders query asks for an index:** create the collection-group `orders` index for `createdAt` descending using Firestore's generated link.
- **Product image does not appear:** use a publicly accessible direct HTTPS image URL.
- **The service sections or seed choices do not load:** make sure the site is served over `http://localhost` and [`service-seeds.js`](./service-seeds.js) is present next to `index.html`.
