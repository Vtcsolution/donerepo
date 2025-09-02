const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');
const connectDB = require('./config/db');
// Remove these if Wallet/Payment functionality is not needed
const { startCreditDeductionJob, startFreeSessionTimerJob } = require('./jobs/creditDeductionJob');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
});
connectDB();
// Middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Attach io to req for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("WebSocket client connected:", socket.id);

  // Join user-specific room based on userId
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("WebSocket client disconnected:", socket.id);
  });
});

// Start credit deduction job with io
startCreditDeductionJob(io);
startFreeSessionTimerJob(io);
// Import route files
const userRoutes = require('./routes/userRoutes');
const aiPsychicRoutes = require("./routes/aiPsychicRoutes");
const chatRoutes = require("./routes/chatRoutes");
const formRoutes = require("./routes/formRoutes");
const adminRoutes = require('./routes/adminRoutes');
const geocodeRoute = require('./routes/geocode.js');
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const timerRoutes = require('./routes/timerRoutes');
const feedback = require ('./routes/feedbackRoutes')
const numerologyRouter = require("./routes/numerologyRoutes");
const astrologyRoutes = require("./routes/astrologyRoutes");
const montlyforcast = require ("./routes/monthly-forcast");
const lovecompatability = require ("./routes/love-compatability")
const translateRoute = require ("./routes/translateRoutes")
const messageRoutes = require("./routes/messageRoutes");

// Use routes
app.use('/api/users', userRoutes);
app.use("/api/psychics", aiPsychicRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/form", formRoutes);
app.use("/api/messages", messageRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/geocode", geocodeRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api', timerRoutes);
app.use('/api', feedback)
app.use("/api", numerologyRouter);
app.use("/api", astrologyRoutes);
app.use("/api", montlyforcast);
app.use("/api", lovecompatability)
app.use("/api/translate", translateRoute);

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});