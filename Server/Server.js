import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // also check current working directory .env

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// In-memory bookings store with seed data
let bookings = [
  {
    id: 'MSR-RZP-984210',
    name: 'Anand Kumar',
    email: 'anand.k@gmail.com',
    date: '2026-07-28',
    roomType: 'Suite Room (₹2,500/night)',
    amount: 2500,
    paymentMethod: 'Online Pre-payment (Razorpay)',
    status: 'Paid Online',
    createdAt: new Date('2026-07-24T09:30:00Z').toISOString(),
  },
  {
    id: 'MSR-CTR-482910',
    name: 'Priya Sharma',
    email: 'priya.s@yahoo.com',
    date: '2026-07-29',
    roomType: 'Dormitory Bed (₹450/night)',
    amount: 450,
    paymentMethod: 'Pay at Counter / Property',
    status: 'Pending at Check-in',
    createdAt: new Date('2026-07-24T10:15:00Z').toISOString(),
  },
  {
    id: 'MSR-RZP-319582',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@outlook.com',
    date: '2026-07-25',
    roomType: 'Suite Room (₹2,500/night)',
    amount: 2500,
    paymentMethod: 'Online Pre-payment (Razorpay)',
    status: 'Checked In',
    createdAt: new Date('2026-07-23T14:20:00Z').toISOString(),
  },
  {
    id: 'MSR-CTR-109284',
    name: 'Siddharth Nair',
    email: 'siddharth@gmail.com',
    date: '2026-07-26',
    roomType: 'Dormitory Bed (₹450/night)',
    amount: 450,
    paymentMethod: 'Pay at Counter / Property',
    status: 'Paid at Counter',
    createdAt: new Date('2026-07-24T11:00:00Z').toISOString(),
  },
];

// Total Inventory Configuration
const TOTAL_SUITES = 5;
const TOTAL_DORM_BEDS = 15;

// In-memory Price Configuration
let roomPrices = {
  suitePrice: 2500,
  dormPrice: 450,
};

// In-memory Maintenance Configuration
let maintenanceStatus = {
  maintenanceSuites: 0,
  maintenanceDormBeds: 0,
  suiteMaintenanceReason: '',
  dormMaintenanceReason: '',
};

// GET current room prices
app.get('/api/prices', (req, res) => {
  res.json(roomPrices);
});

// POST update room prices (Admin)
app.post('/api/admin/prices', (req, res) => {
  const { suitePrice, dormPrice } = req.body;
  if (suitePrice !== undefined && !isNaN(Number(suitePrice))) {
    roomPrices.suitePrice = Number(suitePrice);
  }
  if (dormPrice !== undefined && !isNaN(Number(dormPrice))) {
    roomPrices.dormPrice = Number(dormPrice);
  }
  res.json({ success: true, roomPrices });
});

// GET current maintenance status
app.get('/api/admin/maintenance', (req, res) => {
  res.json(maintenanceStatus);
});

// POST update maintenance status (Admin)
app.post('/api/admin/maintenance', (req, res) => {
  const { maintenanceSuites, maintenanceDormBeds, suiteMaintenanceReason, dormMaintenanceReason } = req.body;
  if (maintenanceSuites !== undefined) {
    maintenanceStatus.maintenanceSuites = Math.min(TOTAL_SUITES, Math.max(0, Number(maintenanceSuites)));
  }
  if (maintenanceDormBeds !== undefined) {
    maintenanceStatus.maintenanceDormBeds = Math.min(TOTAL_DORM_BEDS, Math.max(0, Number(maintenanceDormBeds)));
  }
  if (suiteMaintenanceReason !== undefined) {
    maintenanceStatus.suiteMaintenanceReason = String(suiteMaintenanceReason);
  }
  if (dormMaintenanceReason !== undefined) {
    maintenanceStatus.dormMaintenanceReason = String(dormMaintenanceReason);
  }
  res.json({ success: true, maintenanceStatus });
});

// GET availability for a given date or overall
app.get('/api/availability', (req, res) => {
  const { date } = req.query;

  const activeBookings = bookings.filter(
    (b) => b.status !== 'Cancelled' && (!date || b.date === date)
  );

  const bookedSuites = activeBookings.filter((b) =>
    b.roomType.includes('Suite')
  ).length;

  const bookedDormBeds = activeBookings.filter((b) =>
    b.roomType.includes('Dormitory')
  ).length;

  const availableSuites = Math.max(0, TOTAL_SUITES - bookedSuites - maintenanceStatus.maintenanceSuites);
  const availableDormBeds = Math.max(0, TOTAL_DORM_BEDS - bookedDormBeds - maintenanceStatus.maintenanceDormBeds);

  res.json({
    date: date || null,
    totalSuites: TOTAL_SUITES,
    bookedSuites,
    maintenanceSuites: maintenanceStatus.maintenanceSuites,
    availableSuites,
    totalDormBeds: TOTAL_DORM_BEDS,
    bookedDormBeds,
    maintenanceDormBeds: maintenanceStatus.maintenanceDormBeds,
    availableDormBeds,
    roomPrices,
    maintenanceStatus,
  });
});

// Admin Login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && (password === 'admin' || password === 'admin123')) {
    return res.json({ success: true, token: 'msr_admin_session_token' });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// GET all bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// Create order for Razorpay
app.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: 'INR',
      receipt: 'receipt_order',
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Save online booking completion
app.post('/api/confirm-online-booking', (req, res) => {
  try {
    const { id, name, email, date, roomType, amount, paymentMethod } = req.body;
    const newBooking = {
      id: id || ('MSR-RZP-' + Math.floor(100000 + Math.random() * 900000)),
      name,
      email,
      date,
      roomType: roomType || 'Suite Room (₹2,500/night)',
      amount: Number(amount) || 2500,
      paymentMethod: paymentMethod || 'Online Pre-payment (Razorpay)',
      status: 'Paid Online',
      createdAt: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    res.json({ success: true, booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save counter booking
app.post('/book-counter', (req, res) => {
  try {
    const { name, email, date, roomType } = req.body;
    const bookingId = 'MSR-CTR-' + Math.floor(100000 + Math.random() * 900000);
    const amount = roomType && roomType.includes('Dormitory') ? 450 : 2500;
    
    const newBooking = {
      id: bookingId,
      name,
      email,
      date,
      roomType: roomType || 'Suite Room (₹2,500/night)',
      amount,
      paymentMethod: 'Pay at Counter / Property',
      status: 'Pending at Check-in',
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);

    res.json({
      success: true,
      bookingId,
      message: 'Booking confirmed! Please pay at the counter during check-in.',
      details: newBooking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update booking status
app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (status) {
    booking.status = status;
  }

  res.json({ success: true, booking });
});

// DELETE booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id);
  const initialLength = bookings.length;
  bookings = bookings.filter((b) => b.id !== id && b.id !== decodedId);

  if (bookings.length === initialLength) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({ success: true, message: 'Booking deleted' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});