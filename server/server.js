import http from 'http';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, database } from './config/db.js';
import {
  initSocket,
  emitMerchantsUpdate,
  emitOrdersUpdate,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitRidersUpdate,
  emitSurgeZonesUpdate
} from './services/socketService.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatic .env file loader without extra npm dependencies
const loadEnvFile = () => {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            const val = v.join('=').trim().replace(/(^['"]|['"]$)/g, '');
            if (k && !process.env[k.trim()]) {
              process.env[k.trim()] = val;
            }
          }
        });
      } catch (e) {}
    }
  }
};

loadEnvFile();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration allowing all 4 platform frontend apps:
// Customer App (5173), Merchant Portal (3000), Admin Portal (3001), Delivery Partner App (3002)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Socket.io Real-Time Engine
initSocket(server);

// Mount Modular MVP Routes
app.use('/api', apiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    platform: 'UrbanOne Hyperlocal Platform',
    stack: 'MERN Stack (MongoDB, Express, React, Node.js)',
    architecture: 'MVP (Model-View-Presenter)',
    status: 'online',
    healthCheck: '/api/health'
  });
});

// Re-export real-time broadcast helpers & database for backward compatibility
export {
  emitMerchantsUpdate,
  emitOrdersUpdate,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitRidersUpdate,
  emitSurgeZonesUpdate,
  database
};

// Start Server & Connect MongoDB
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`🚀 UrbanOne MERN Stack Backend running on http://localhost:${PORT}`);
  console.log(`📐 Architecture: MVP (Model-View-Presenter)`);
  console.log(`⚡ Socket.io Real-Time Engine Active`);
  console.log(`📍 Operating Zone: Ushait, UP`);
  console.log(`🌐 Connected View Portals:`);
  console.log(`   - Customer App:   http://localhost:5173`);
  console.log(`   - Merchant OS:    http://localhost:3000`);
  console.log(`   - Admin Command:  http://localhost:3001`);
  console.log(`=======================================================`);

  // Initialize MongoDB Connection (with auto-fallback)
  await connectDB();
});
