import express from 'express';
import authRoutes from './authRoutes.js';
import merchantRoutes from './merchantRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminRoutes from './adminRoutes.js';
import fleetRoutes from './fleetRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import { database } from '../config/db.js';

const router = express.Router();

// Health check route reporting MERN stack details & connection status
router.get('/health', async (req, res) => {
  const merchants = await database.getAllMerchants();
  const orders = await database.getAllOrders();
  const riders = await database.getAllRiders();
  const dbInfo = database.getConnectionInfo();

  const isTwilioConfigured = process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid_here' &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;

  res.json({
    status: 'healthy',
    stack: 'MERN Stack (MongoDB, Express, React, Node.js)',
    architecture: 'MVP (Model-View-Presenter)',
    operatingCity: 'Ushait, UP',
    version: '5.0.0-mern-mvp',
    database: dbInfo.engine,
    dbStatus: dbInfo.status,
    mongoUri: dbInfo.uri,
    smsGateway: isTwilioConfigured ? 'Twilio Real-Time SMS Gateway (Live Active)' : 'Twilio SMS Gateway (Simulated / Add credentials in .env)',
    twilioFromNumber: process.env.TWILIO_PHONE_NUMBER || 'Not Configured',
    serverTime: new Date().toISOString(),
    metrics: {
      merchantsCount: merchants.length,
      ordersCount: orders.length,
      activeRidersCount: riders.filter(r => r.isOnline).length
    }
  });
});

// High-accuracy reverse geocoding proxy
router.get('/geocode/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
  }

  let street = '';
  let landmark = '';
  let pinCode = '';
  let locality = 'Ushait';
  let displayName = '';

  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&email=kalsenone.delivery@gmail.com`;
    const osmRes = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'KalsenOne-FoodPlatform/1.0 (kalsenone.delivery@gmail.com)'
      }
    });

    if (osmRes.ok) {
      const data = await osmRes.json();
      const addr = data.address || {};
      displayName = data.display_name || '';

      const road = addr.road || addr.street || addr.neighbourhood || addr.suburb || addr.residential;
      locality = addr.village || addr.town || addr.city || addr.suburb || addr.county || addr.state_district || 'Ushait';
      const state = addr.state || 'Uttar Pradesh';

      // Always anchor to Ushait 243641 for KalsenOne delivery zone
      const isUshaitZone = locality.toLowerCase().includes('ushait') || 
                           locality.toLowerCase().includes('dataganj') || 
                           locality.toLowerCase().includes('budaun') || 
                           locality.toLowerCase().includes('badaun') || 
                           (addr.postcode && addr.postcode.startsWith('243')) ||
                           !addr.postcode;

      pinCode = isUshaitZone ? '243641' : (addr.postcode || '243641');
      locality = isUshaitZone ? 'Ushait' : locality;
      street = road ? `${road}, Ushait` : `Main Market Road, Ushait`;
      landmark = `Near Clock Tower, Ushait (${pinCode})`;
    }
  } catch (err) {
    console.warn('[Reverse Geocode OSM Error]:', err.message);
  }

  // Fallback via BigDataCloud if needed
  if (!street) {
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl);
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        locality = 'Ushait';
        pinCode = '243641';
        street = `Main Market Road, Ushait`;
        landmark = `Near Clock Tower, Ushait (${pinCode})`;
      }
    } catch (e) {}
  }

  if (!street) {
    street = 'Main Market Road, Ushait';
    landmark = 'Near Clock Tower, Ushait';
    pinCode = '243641';
  }

  return res.json({
    success: true,
    data: {
      street,
      landmark,
      pinCode,
      locality,
      displayName,
      coords: {
        lat: parseFloat(lat),
        lng: parseFloat(lon)
      }
    }
  });
});

// Mount domain routes
router.use('/auth', authRoutes);
router.use('/merchants', merchantRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/', fleetRoutes);

export default router;
