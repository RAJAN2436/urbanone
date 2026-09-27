import express from 'express';
import { AdminPresenter } from '../presenters/AdminPresenter.js';
import { MerchantPresenter } from '../presenters/MerchantPresenter.js';

const router = express.Router();

router.get('/metrics', AdminPresenter.getMetrics);
router.post('/merchants', MerchantPresenter.createMerchant);
router.delete('/merchants/:id', MerchantPresenter.deleteMerchant);
router.patch('/merchants/reorder', AdminPresenter.reorder);
router.patch('/merchants/:id/pin-top', AdminPresenter.pinToTop);
router.patch('/merchants/:id/rank', AdminPresenter.moveRank);
router.patch('/merchants/:id/boost', AdminPresenter.updateBoostScore);
router.patch('/merchants/:id/promoted', AdminPresenter.togglePromoted);
router.patch('/merchants/:id/featured', AdminPresenter.toggleFeatured);
router.patch('/merchants/:id/approval', AdminPresenter.updateApproval);
router.patch('/merchants/:id/rating', AdminPresenter.updateRating);
router.patch('/riders/:id/kyc', AdminPresenter.toggleRiderKYC);
router.patch('/riders/:id/approval', AdminPresenter.updateRiderApproval);
router.delete('/riders/:id', AdminPresenter.deleteRider);
router.patch('/surge-zones/:id', AdminPresenter.updateSurgeZone);

export default router;
