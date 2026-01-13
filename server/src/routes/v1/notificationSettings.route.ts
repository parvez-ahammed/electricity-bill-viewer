import { NotificationSettingsController } from '@controllers/v1/NotificationSettingsController';
import { Router } from 'express';

const notificationSettingsRouter = Router();
const controller = new NotificationSettingsController();

notificationSettingsRouter.get('/telegram', controller.getSettings);
notificationSettingsRouter.post('/telegram', controller.updateSettings);
notificationSettingsRouter.put('/telegram', controller.updateSettings); // Support PUT as alias for upsert
notificationSettingsRouter.patch('/telegram', controller.updateSettings); // Support PATCH as alias for upsert
notificationSettingsRouter.delete('/telegram', controller.deleteSettings);

export default notificationSettingsRouter;
