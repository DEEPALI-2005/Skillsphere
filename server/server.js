const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const http         = require('http');
const { Server }   = require('socket.io');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');


dotenv.config();

const connectDB      = require('./config/db');
const socketHandler  = require('./socket/socketHandler');
const passport       = require('./config/passport');

connectDB();

const app    = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://skillsphere-client.vercel.app'
    ],
    credentials: true
  }
});

socketHandler(io);

// Security
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Bahut zyada requests! Thodi der baad try karo.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Bahut zyada login attempts!' }
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://skillsphere-client.vercel.app'
  ],
  credentials: true
}));

// Routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/gigs',          require('./routes/gigRoutes'));
app.use('/api/proposals',     require('./routes/proposalRoutes'));
app.use('/api/messages',      require('./routes/messageRoutes'));
app.use('/api/reviews',       require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payments',      require('./routes/paymentRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/upload',        require('./routes/uploadRoutes'));
app.use('/api/disputes',      require('./routes/disputeRoutes'));
app.use('/api/progress',      require('./routes/progressRoutes'));
app.use('/api/2fa',           require('./routes/twoFactorRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SkillSphere API is running! 🚀' });
});

// Error middleware — sabse last mein!
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});