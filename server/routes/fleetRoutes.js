import express from 'express';
import { FleetPresenter } from '../presenters/FleetPresenter.js';

const router = express.Router();

router.get('/riders', FleetPresenter.getRiders);
router.post('/riders', FleetPresenter.createRider);
router.patch('/riders/:id/duty', FleetPresenter.updateRiderDuty);
router.delete('/riders/:id', FleetPresenter.deleteRider);

router.get('/surge-zones', FleetPresenter.getSurgeZones);
router.post('/surge-zones', FleetPresenter.createSurgeZone);

router.get('/promos', FleetPresenter.getPromoCodes);
router.post('/promos', FleetPresenter.createPromoCode);

export default router;
