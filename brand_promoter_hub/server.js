const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/brand_promoter_hub', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String
});
const User = mongoose.model('User', userSchema);

// Campaign Schema
const campaignSchema = new mongoose.Schema({
  name: String,
  product: String,
  budget: Number,
  platform: String,
  brandEmail: String
});
const Campaign = mongoose.model('Campaign', campaignSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
  campaignId: String,
  promoterEmail: String
});
const Application = mongoose.model('Application', applicationSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  message: String,
  campaignName: String,
  userEmail: String
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  fromEmail: String,
  toEmail: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Sign-Up
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Set Role
app.post('/api/set-role', async (req, res) => {
  const { email, role } = req.body;
  try {
    await User.updateOne({ email }, { role });
    res.status(200).json({ message: 'Role set' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to set role' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ email, role: user.role }, 'secret', { expiresIn: '1h' });
  res.json({ token, role: user.role });
});

// Verify Token
app.get('/api/verify', verifyToken, (req, res) => {
  res.json({ message: 'Authenticated' });
});

// Create Campaign
app.post('/api/campaigns', verifyToken, async (req, res) => {
  const campaign = new Campaign({ ...req.body, brandEmail: req.user.email });
  await campaign.save();
  res.status(201).json({ message: 'Campaign created' });
});

// Get Campaigns (Brand)
app.get('/api/campaigns', verifyToken, async (req, res) => {
  if (req.user.role === 'brand') {
    const campaigns = await Campaign.find({ brandEmail: req.user.email });
    res.json(campaigns);
  } else {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  }
});

// Apply to Campaign
app.post('/api/apply', verifyToken, async (req, res) => {
  const application = new Application({
    campaignId: req.body.campaignId,
    promoterEmail: req.user.email
  });
  await application.save();
  res.status(201).json({ message: 'Applied to campaign' });
});

// Get My Campaigns
app.get('/api/my-campaigns', verifyToken, async (req, res) => {
  const applications = await Application.find({ promoterEmail: req.user.email });
  const campaignIds = applications.map(a => a.campaignId);
  const campaigns = await Campaign.find({ _id: { $in: campaignIds } });
  res.json(campaigns);
});

// Get Feedback
app.get('/api/feedback', verifyToken, async (req, res) => {
  const feedback = await Feedback.find({ userEmail: req.user.email });
  res.json(feedback);
});

// Get Users
app.get('/api/users', verifyToken, async (req, res) => {
  const users = await User.find({}, 'name email role');
  res.json(users);
});

// Socket.IO Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  socket.join(socket.user.email);
  socket.on('send-message', async ({ toEmail, message }) => {
    const msg = new Message({
      fromEmail: socket.user.email,
      toEmail,
      message
    });
    await msg.save();
    io.to(toEmail).emit('receive-message', { fromEmail: socket.user.email, message });
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));