import express from 'express';
import { AuthPresenter } from '../presenters/AuthPresenter.js';

const router = express.Router();

router.post('/send-otp', AuthPresenter.sendOtp);
router.post('/verify-otp', AuthPresenter.verifyOtp);
router.post('/login-password', AuthPresenter.loginWithPassword);
router.post('/google', AuthPresenter.googleAuth);
router.post('/register', AuthPresenter.register);
router.post('/complete-profile', AuthPresenter.completeProfile);
router.get('/user/:id', AuthPresenter.getUserProfile);
router.post('/user/:userId/address', AuthPresenter.addAddress);
router.delete('/user/:userId/address/:addressId', AuthPresenter.deleteAddress);
router.post('/forgot-password/request', AuthPresenter.requestPasswordReset);
router.post('/forgot-password/reset', AuthPresenter.resetPassword);

// Merchant Portal Auth (Username & Password)
router.post('/merchant/login', AuthPresenter.merchantLogin);
router.post('/merchant/register', AuthPresenter.merchantRegister);

// Delivery Partner App Auth (Login & Register with Admin Approval)
router.post('/rider/login', AuthPresenter.riderLogin);
router.post('/rider/register', AuthPresenter.riderRegister);
router.get('/rider/:id/status', AuthPresenter.getRiderStatus);
router.patch('/rider/:id/profile', AuthPresenter.updateRiderProfile);

export default router;
