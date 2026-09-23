# Ganpati Inventory & Billing Management System — MERN Stack

Professional MERN-stack conversion of the Ganpati Inventory & Billing system.
**100% identical UI, features, and business logic** — only the architecture changed.

## Stack
- **Frontend:** React.js, React Router, Axios
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT + bcrypt
- **UPI Payments:** Dynamic QR codes (upi://pay deep links)

## Project Structure

```
ganpati-mern/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/      # Auth, file upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # (reserved for business services)
│   ├── utils/           # UPI builder, seed script
│   ├── uploads/          # Uploaded images
│   ├── app.js
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── public/
    └── src/
        ├── api/               # Axios API layer (one file per resource)
        ├── components/        # Reusable components (Button, Navbar, Invoice, etc.)
        ├── pages/             # One folder per page (JSX + CSS)
        ├── context/           # Auth, Settings, Toast contexts
        ├── utils/             # format, upi, printInvoice helpers
        └── App.js
```

## Setup

### 1. Backend
```bash
cd backend
npm install
copy .env.example .env
# Fill every required value in .env before starting.
npm run seed
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start           # starts on http://localhost:3000
```

### 3. First owner setup

The seed command never creates credentials. The first owner must be created through the protected first-registration flow with a strong password. Subsequent registration is closed by the API.

## Environment Variables

Copy `backend/.env.example` to `backend/.env`. Required production values are `MONGODB_URI`, `JWT_SECRET` (minimum 64 characters), and `CLIENT_URL`. Multiple allowed client origins can be comma-separated in `CLIENT_URL`.

Copy `frontend/.env.example` to `frontend/.env` and set `REACT_APP_API_URL` to the deployed API URL.

Optional integrations use environment variables only: Sentry, Razorpay, SMTP, Cloudinary, and session configuration placeholders are included in `backend/.env.example`.

## Production Deployment

1. Provision MongoDB with authentication, backups, and network restrictions.
2. Set production values from `backend/.env.example`; never commit `.env` files.
3. Build the frontend with `npm run build` and serve `frontend/build` from a static host or Nginx.
4. Start the API with PM2 from the repository root:

```bash
npm --prefix backend install --omit=dev
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The API is HTTPS-ready behind a reverse proxy. Terminate TLS at Nginx, Apache, Render, Railway, or the selected hosting platform and proxy requests to the PM2 API port. Set `CLIENT_URL` to the HTTPS frontend origin only.

## Backup and Restore

MongoDB Database Tools (`mongodump` and `mongorestore`) must be installed on the deployment host.

```bash
cd backend
npm run backup
npm run restore -- ./backups/<timestamp>
```

Backups and application logs are excluded from Git. Schedule `npm run backup` using the host scheduler and store copies outside the application server.

## Security Notes

- Startup fails when `MONGODB_URI`, `JWT_SECRET`, or `CLIENT_URL` is missing; production JWT secrets must be at least 64 characters.
- Helmet, compression, HPP, Mongo sanitization, XSS filtering, cookie parsing, CORS allowlisting, Zod validation, upload validation, and route-specific rate limits are enabled.
- API errors return generic messages; detailed errors are written to `backend/logs/application.log` and optionally to Sentry.
- Login, billing, invoice, and upload endpoints return HTTP 429 when rate limits are exceeded.
- Create a database owner through the first-registration flow; no default credentials exist.

## Features (unchanged from original)
- Dashboard with live stats
- Inventory CRUD with image upload
- Billing with cart, discounts, and UPI QR payments
- Sales history with search/filter
- Customer Due List with "Receive Payment"
- Reports (daily/weekly/monthly/best-selling/stock)
- Customers directory with purchase history
- Shop Settings incl. UPI ID & logo
- Dynamic UPI QR: `upi://pay?pa=<UPI_ID>&pn=<SHOP>&am=<AMOUNT>&cu=INR&tn=<NOTE>`
- Print / PDF invoice generation
