import express from 'express';
import { MerchantPresenter } from '../presenters/MerchantPresenter.js';

const router = express.Router();

router.get('/', MerchantPresenter.getAll);
router.post('/', MerchantPresenter.createMerchant);
router.post('/login', MerchantPresenter.login);
router.post('/register', MerchantPresenter.register);
router.get('/:id', MerchantPresenter.getById);
router.put('/:id', MerchantPresenter.updateProfile);
router.delete('/:id', MerchantPresenter.deleteMerchant);

// Dishes Management
router.post('/:id/dishes', MerchantPresenter.addDish);
router.put('/:id/dishes/:dishId', MerchantPresenter.updateDish);
router.delete('/:id/dishes/:dishId', MerchantPresenter.deleteDish);
router.patch('/:id/dishes/:dishId/stock', MerchantPresenter.toggleDishStock);

// Merchant Open/Closed Toggle
router.patch('/:id/status', MerchantPresenter.toggleStatus);

export default router;
