import { database } from '../config/db.js';
import { emitRidersUpdate, emitSurgeZonesUpdate, emitPromoCodesUpdate } from '../services/socketService.js';

export const FleetPresenter = {
  // GET /api/riders
  getRiders: async (req, res) => {
    try {
      const riders = await database.getAllRiders();
      return res.json({
        success: true,
        count: riders.length,
        riders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/riders
  createRider: async (req, res) => {
    try {
      const { name, phone } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Rider name and phone are required' });
      }
      const riders = await database.createRider(req.body);
      await emitRidersUpdate(riders);
      return res.status(201).json({
        success: true,
        message: `Rider ${name} registered in MongoDB successfully`,
        riders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/riders/:id/duty
  updateRiderDuty: async (req, res) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;
      const riders = await database.updateRiderOnlineStatus(id, isOnline);
      await emitRidersUpdate(riders);
      return res.json({
        success: true,
        message: `Rider duty status updated to ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
        riders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/riders/:id
  deleteRider: async (req, res) => {
    try {
      const { id } = req.params;
      const riders = await database.deleteRider(id);
      await emitRidersUpdate(riders);
      return res.json({
        success: true,
        message: 'Delivery partner deleted successfully',
        riders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/surge-zones
  getSurgeZones: async (req, res) => {
    try {
      const zones = await database.getAllSurgeZones();
      return res.json({
        success: true,
        count: zones.length,
        zones
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/surge-zones
  createSurgeZone: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Surge zone name is required' });
      }
      const zones = await database.createSurgeZone(req.body);
      await emitSurgeZonesUpdate(zones);
      return res.status(201).json({
        success: true,
        message: `Surge zone ${name} stored in MongoDB successfully`,
        zones
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/promos
  getPromoCodes: async (req, res) => {
    try {
      const promos = await database.getAllPromoCodes();
      return res.json({
        success: true,
        count: promos.length,
        promos
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/promos
  createPromoCode: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Promo code is required' });
      }
      const promos = await database.createPromoCode(req.body);
      await emitPromoCodesUpdate(promos);
      return res.status(201).json({
        success: true,
        message: `Promo code ${code} saved in MongoDB`,
        promos
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
