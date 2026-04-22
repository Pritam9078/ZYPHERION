import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import operationRoutes from './routes/operations';
import advancedRoutes from './routes/advanced';
import logicRuleRoutes from './routes/logicRules';
import adminRoutes from './routes/admin';
import { webhookRoutes } from './routes/webhooks';
import billingRoutes from './routes/billing';
import { initAutomationWorker } from './services/AutomationWorker';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Initialize Automation
initAutomationWorker(io);

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zypherion';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());

// Socket.io Real-time logic
io.on('connection', (socket) => {
  console.log('[Zypherion] Client connected:', socket.id);
  
  socket.on('join_protocol', (walletAddress) => {
    socket.join(walletAddress);
    console.log(`[Zypherion] Admin/User ${walletAddress} joined telemetry stream.`);
  });

  socket.on('disconnect', () => {
    console.log('[Zypherion] Client disconnected');
  });
});

// Middleware to inject IO into routes
app.use((req: any, res: any, next: any) => {
  (req as any).io = io;
  next();
});

// Load Swagger YAML
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/api-docs', ...swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Legacy Routes
app.use('/api/auth', authRoutes);
app.use('/api/ops', operationRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/api/rules', logicRuleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);

// SDK-First v1 Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/proof', operationRoutes);
app.use('/v1/execute', operationRoutes); // Will add trigger to operationRoutes
app.use('/v1/rules', logicRuleRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/webhooks', webhookRoutes);

app.get('/health', (req: any, res: any) => {
  res.json({ status: 'Zypherion Backend Online', realtime: 'Active' });
});

httpServer.listen(PORT, () => {
  console.log(`Zypherion server running on port ${PORT} (HTTP + WebSockets)`);
});
