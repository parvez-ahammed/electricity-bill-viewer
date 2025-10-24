import { Router } from 'express';
import { ElectricityController } from '../../controllers/v1/ElectricityController';

const router = Router();
const electricityController = new ElectricityController();

router.get('/usage', electricityController.getUsageData);
router.get('/health', electricityController.healthCheck);

export default router;
