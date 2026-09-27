import { database } from '../config/db.js';
import {
  emitMerchantsUpdate,
  emitRidersUpdate,
  emitSurgeZonesUpdate
} from '../services/socketService.js';

export const AdminPresenter = {
  // GET /api/admin/metrics
  getMetrics: async (req, res) => {
    try {
      const merchants = await database.getAllMerchants();
      const orders = await database.getAllOrders();
      const riders = await database.getAllRiders();

      const totalGmv = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
      const activeOrders = orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');

      return res.json({
        success: true,
        totalGmv,
        totalOrders: orders.length,
        activeOrdersCount: activeOrders.length,
        deliveredOrdersCount: deliveredOrders.length,
        totalMerchants: merchants.length,
        openMerchants: merchants.filter(m => m.isOpen).length,
        totalRiders: riders.length,
        activeRiders: riders.filter(r => r.isOnline).length
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/pin-top
  pinToTop: async (req, res) => {
    try {
      const updatedMerchants = await database.pinMerchantToTop(req.params.id);
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: 'Merchant pinned to #1 Top Spotlight on Customer App!',
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/reorder
  reorder: async (req, res) => {
    try {
      const { merchantIds } = req.body;
      const updatedMerchants = await database.reorderMerchants(merchantIds);
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: 'Merchant ranking order updated across customer app!',
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/rank
  moveRank: async (req, res) => {
    try {
      const { direction } = req.body;
      const updatedMerchants = await database.moveMerchantRank(req.params.id, direction || 'up');
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: `Merchant moved ${direction || 'up'} in placement rankings`,
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/boost
  updateBoostScore: async (req, res) => {
    try {
      const { score } = req.body;
      const updatedMerchants = await database.updateMerchantBoostScore(req.params.id, score);
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: `Algorithmic boost score set to ${score}`,
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/promoted
  togglePromoted: async (req, res) => {
    try {
      const nextPromoted = await database.toggleMerchantPromoted(req.params.id);
      const updatedMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: nextPromoted ? 'Merchant is now Promoted / Sponsored' : 'Organic ranking restored',
        isPromoted: nextPromoted,
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/featured
  toggleFeatured: async (req, res) => {
    try {
      const nextFeatured = await database.toggleMerchantFeatured(req.params.id);
      const updatedMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: nextFeatured ? 'Merchant marked as Featured' : 'Removed from Featured',
        isFeatured: nextFeatured,
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/approval
  updateApproval: async (req, res) => {
    try {
      const { status } = req.body;
      await database.updateMerchantApprovalStatus(req.params.id, status || 'approved');
      const updatedMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: `Store approval status updated to ${status}`,
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/merchants/:id/rating
  updateRating: async (req, res) => {
    try {
      const { rating, ratingCount } = req.body;
      const updatedMerchants = await database.updateMerchantRating(req.params.id, rating, ratingCount);
      await emitMerchantsUpdate(updatedMerchants);

      return res.json({
        success: true,
        message: `Merchant rating updated to ${rating}`,
        merchants: updatedMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/riders/:id/kyc
  toggleRiderKYC: async (req, res) => {
    try {
      const { kycVerified } = req.body;
      const updatedRiders = await database.toggleRiderKYC(req.params.id, kycVerified);
      await emitRidersUpdate(updatedRiders);

      return res.json({
        success: true,
        message: 'Rider KYC verification updated successfully',
        riders: updatedRiders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/riders/:id/approval
  updateRiderApproval: async (req, res) => {
    try {
      const { status } = req.body;
      const updatedRiders = await database.updateRiderApprovalStatus(req.params.id, status || 'approved');
      await emitRidersUpdate(updatedRiders);

      try {
        const { getIO } = await import('../services/socketService.js');
        const io = getIO();
        if (io) {
          io.emit('rider:approval_updated', {
            riderId: req.params.id,
            approvalStatus: status || 'approved',
            kycVerified: (status || 'approved') === 'approved'
          });
        }
      } catch (e) {}

      return res.json({
        success: true,
        message: `Rider application ${status || 'approved'} successfully`,
        riders: updatedRiders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/admin/riders/:id
  deleteRider: async (req, res) => {
    try {
      const updatedRiders = await database.deleteRider(req.params.id);
      await emitRidersUpdate(updatedRiders);
      return res.json({
        success: true,
        message: 'Delivery partner deleted successfully from database',
        riders: updatedRiders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/surge-zones/:id
  updateSurgeZone: async (req, res) => {
    try {
      const { multiplier } = req.body;
      const updatedZones = await database.updateSurgeZone(req.params.id, multiplier);
      await emitSurgeZonesUpdate(updatedZones);

      return res.json({
        success: true,
        message: `Surge multiplier updated to ${multiplier}x`,
        zones: updatedZones
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
