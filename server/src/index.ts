import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/index.js';
import authRouter from './routes/auth.js';
import productRouter, { seedProducts } from './routes/products.js';
import roomRouter from './routes/rooms.js';
import messageRouter from './routes/messages.js';
import sharedCartRouter from './routes/sharedCart.js';
import voteRouter from './routes/votes.js';
import analyticsRouter from './routes/analytics.js';
import recommendationRouter from './routes/recommendations.js';
import checkoutRouter, { mynCoinsRouter } from './routes/checkout.js';
import ordersRouter from './routes/orders.js';
import { setupSocketHandlers } from './socket/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
app.use(express.json());

initializeDatabase();
seedProducts();

app.set('io', io);

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/messages', messageRouter);
app.use('/api/rooms', sharedCartRouter);
app.use('/api/rooms', voteRouter);
app.use('/api/rooms', analyticsRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/rooms', checkoutRouter);
app.use('/api/myncoins', mynCoinsRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built frontend if it exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('Serving frontend from', clientDist);
} else {
  app.get('/', (_req, res) => {
    res.send(`
      <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9fafb">
        <div style="text-align:center">
          <h1 style="color:#7c3aed">Myntra Fashion Rooms</h1>
          <p style="color:#6b7280">API server is running</p>
          <p style="font-size:14px;color:#9ca3af">Frontend: <a href="http://localhost:5173" style="color:#7c3aed">http://localhost:5173</a></p>
        </div>
      </body></html>
    `);
  });
}

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { io };
