import { NotificationSettingsController } from '@controllers/v1/NotificationSettingsController';
import { Router } from 'express';
import { validate } from '../../middlewares/ValidationMiddleware';
import { updateSettingsValidation } from '../../schemas/NotificationSettingsSchemas';

const notificationSettingsRouter = Router();
const controller = new NotificationSettingsController();

notificationSettingsRouter.get('/telegram', controller.getSettings);
notificationSettingsRouter.post('/telegram', validate(updateSettingsValidation), controller.updateSettings);
notificationSettingsRouter.put('/telegram', validate(updateSettingsValidation), controller.updateSettings); // Support PUT as alias for upsert
notificationSettingsRouter.patch('/telegram', validate(updateSettingsValidation), controller.updateSettings); // Support PATCH as alias for upsert
notificationSettingsRouter.delete('/telegram', controller.deleteSettings);

export default notificationSettingsRouter;
