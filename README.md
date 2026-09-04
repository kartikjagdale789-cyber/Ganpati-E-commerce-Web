# 🙏 Ganpati Inventory & Billing Management System — MERN Stack

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
npm run seed      # creates admin user + sample data
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start           # starts on http://localhost:3000
```

### 3. Login
```
Username: admin
Password: ganpati123
```

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ganpati_billing
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

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
