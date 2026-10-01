# 🏔️ Mountain Stay Retreat

A modern full-stack web application for resort and retreat room booking and hospitality management, built with React, Vite, Tailwind CSS, Express.js, and Razorpay integration.

---

## ✨ Features

### 🏨 Guest & Booking Experience
- **Interactive Room Booking**: Book Suite Rooms and Dormitory Beds with date selection and live availability calculation.
- **Flexible Payment Methods**:
  - **Online Payment**: Seamless checkout integrated with Razorpay gateway.
  - **Pay at Counter / Property**: On-spot reservation option with instant booking confirmation ID.
- **Dynamic Availability Engine**: Real-time checking of available suites and dormitory beds based on confirmed bookings and active maintenance blocks for selected dates.
- **Responsive & Modern UI**: Built with Tailwind CSS, clean gradients, and intuitive modal dialogs.

### 🛡️ Admin Dashboard & Property Management
- **Secure Admin Authentication**: Protected admin portal access.
- **Live Booking Management**:
  - View all reservations with detailed guest information, room type, status, and payment method.
  - Filter bookings by status (Paid Online, Pending at Check-in, Checked In, Paid at Counter).
  - Update booking status or remove reservations in real time.
- **Dynamic Pricing Controls**: Update Suite and Dormitory pricing directly from the dashboard without redeploying.
- **Maintenance Status Controls**: Mark individual rooms or dormitory beds under maintenance with custom reasons to temporarily block inventory.
- **Analytics & Key Metrics**: Live overview of total bookings, revenue, active check-ins, and pending payments.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [React Datepicker](https://reactdatepicker.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [CORS](https://www.npmjs.com/package/cors), [dotenv](https://www.npmjs.com/package/dotenv)
- **Payment Gateway**: [Razorpay Node SDK](https://razorpay.com/docs/payments/payment-gateway/node-js-integration/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashfeerka007-netizen/mountain_stay_retrete.git
   cd mountain_stay_retrete
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Copy `Server/.env.example` to `Server/.env` and add your Razorpay API keys if you want to test live payments:
   ```bash
   cp Server/.env.example Server/.env
   ```

---

## 🏃 Running the Application

### 1. Start the Backend API Server
```bash
npm run server
```
*The server will start on `http://localhost:5000`.*

### 2. Start the Frontend Development Server
In a new terminal window:
```bash
npm run dev
```
*The React app will be available at `http://localhost:5173`.*

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/availability` | Fetch live room availability for today or a specific `?date=YYYY-MM-DD` |
| `GET` | `/api/prices` | Get current room pricing configuration |
| `POST` | `/api/admin/prices` | Update room pricing (Admin) |
| `GET` | `/api/admin/maintenance` | Get current maintenance room blocks |
| `POST` | `/api/admin/maintenance` | Update maintenance room blocks (Admin) |
| `POST` | `/api/admin/login` | Admin login validation |
| `GET` | `/api/bookings` | Fetch all active bookings |
| `POST` | `/create-order` | Create Razorpay order |
| `POST` | `/api/confirm-online-booking` | Confirm and record successful Razorpay payment |
| `POST` | `/book-counter` | Create a counter/property booking |
| `PATCH` | `/api/bookings/:id` | Update booking status |
| `DELETE` | `/api/bookings/:id` | Delete booking record |

---

## 📄 License

This project is licensed under the MIT License.
