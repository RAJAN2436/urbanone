import { database } from '../config/db.js';
import { emitMerchantsUpdate } from '../services/socketService.js';

export const MerchantPresenter = {
  // GET /api/merchants
  getAll: async (req, res) => {
    try {
      const merchants = await database.getAllMerchants();
      return res.json({
        success: true,
        count: merchants.length,
        merchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/merchants/:id
  getById: async (req, res) => {
    try {
      const merchant = await database.getMerchantById(req.params.id);
      if (!merchant) {
        return res.status(404).json({ success: false, message: 'Merchant not found' });
      }
      return res.json({ success: true, merchant });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/merchants/:id
  updateProfile: async (req, res) => {
    try {
      const updated = await database.updateMerchant(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Merchant not found' });
      }
      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);

      return res.json({
        success: true,
        message: 'Store profile updated successfully',
        merchant: updated,
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/merchants (Create New Merchant / Store)
  createMerchant: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Merchant store name is required' });
      }

      const created = await database.createMerchant(req.body);
      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);

      return res.status(201).json({
        success: true,
        message: `Store "${created.name}" created successfully`,
        merchant: created,
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/merchants/:id/dishes
  addDish: async (req, res) => {
    try {
      const merchant = await database.getMerchantById(req.params.id);
      if (!merchant) {
        return res.status(404).json({ success: false, message: 'Merchant not found' });
      }

      const { name, price, category, description, isVeg, image, id, inStock, isBestseller } = req.body;
      if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Dish name and price are required' });
      }

      const newDish = {
        id: id || `d-${Date.now()}`,
        merchantId: req.params.id,
        name: name.trim(),
        price: Number(price),
        category: category || 'Specials',
        description: description || 'Prepared fresh with artisan ingredients in Ushait.',
        isVeg: isVeg ?? true,
        isBestseller: Boolean(isBestseller),
        inStock: inStock ?? true,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
      };

      await database.addDish(newDish);
      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);

      console.log(`[Listing Added] 🍽️ New dish "${newDish.name}" added to merchant ${merchant.name} (id: ${merchant.id})`);

      return res.status(201).json({
        success: true,
        message: `Dish "${newDish.name}" added successfully to menu`,
        dish: newDish,
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/merchants/:id/dishes/:dishId
  updateDish: async (req, res) => {
    try {
      await database.updateDish(req.params.dishId, req.body);
      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);

      return res.json({
        success: true,
        message: 'Dish details updated successfully',
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/merchants/:id/dishes/:dishId
  deleteDish: async (req, res) => {
    try {
      await database.deleteDish(req.params.dishId);
      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);

      return res.json({
        success: true,
        message: 'Dish removed from menu',
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/merchants/:id/dishes/:dishId/stock
  toggleDishStock: async (req, res) => {
    try {
      const newStock = await database.toggleDishStock(req.params.dishId);
      if (newStock === null) {
        return res.status(404).json({ success: false, message: 'Dish not found in database' });
      }

      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);
      return res.json({
        success: true,
        message: `Dish is now ${newStock ? 'IN STOCK' : 'OUT OF STOCK'}`,
        inStock: newStock,
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/merchants/:id/status
  toggleStatus: async (req, res) => {
    try {
      const newStatus = await database.toggleMerchantStatus(req.params.id);
      if (newStatus === null) {
        return res.status(404).json({ success: false, message: 'Merchant not found in database' });
      }

      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);
      return res.json({
        success: true,
        message: `Store is now ${newStatus ? 'OPEN' : 'CLOSED'} for online orders`,
        isOpen: newStatus,
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/merchants/:id
  deleteMerchant: async (req, res) => {
    try {
      const { id } = req.params;
      const allMerchants = await database.deleteMerchant(id);
      await emitMerchantsUpdate(allMerchants);
      console.log(`[MerchantPresenter] 🗑️ Deleted merchant ${id}, remaining stores: ${allMerchants.length}`);
      return res.json({
        success: true,
        message: 'Merchant store and all its dishes deleted successfully from MongoDB',
        merchants: allMerchants
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/merchants/login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username/Email and password are required' });
      }
      const merchant = await database.validateMerchantPassword(username, password);
      if (!merchant) {
        return res.status(401).json({
          success: false,
          message: 'Invalid merchant username or password. Please verify your credentials or register your store.'
        });
      }
      const token = `kalsen_merchant_jwt_${Date.now()}`;
      return res.json({
        success: true,
        message: `Welcome back to Merchant OS, ${merchant.name}!`,
        token,
        merchant
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/merchants/register
  register: async (req, res) => {
    try {
      const { name, password } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Store name is required' });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
      }
      const created = await database.createMerchant(req.body);
      const allMerchants = await database.getAllMerchants();
      await emitMerchantsUpdate(allMerchants);
      const token = `kalsen_merchant_jwt_${Date.now()}`;
      return res.status(201).json({
        success: true,
        message: `Store "${created.name}" registered and activated in MongoDB!`,
        token,
        merchant: created
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
