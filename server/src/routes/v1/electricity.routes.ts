import { Router } from 'express';
import { ElectricityController } from '../../controllers/v1/ElectricityController';

const router = Router();
const electricityController = new ElectricityController();

router.post('/usage', electricityController.getUsageData);
router.post('/usage/single', electricityController.getSingleUsageData);
router.get('/health', electricityController.healthCheck);

export default router;
