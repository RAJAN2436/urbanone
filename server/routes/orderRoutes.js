import express from 'express';
import { OrderPresenter } from '../presenters/OrderPresenter.js';

const router = express.Router();

router.get('/', OrderPresenter.getAll);
router.delete('/', OrderPresenter.clearAll);
router.post('/', OrderPresenter.create);
router.get('/:id', OrderPresenter.getById);
router.patch('/:id/status', OrderPresenter.updateStatus);
router.patch('/:id/location', OrderPresenter.updateLocation);
router.post('/:id/verify-delivery-otp', OrderPresenter.verifyDeliveryOtp);

export default router;
