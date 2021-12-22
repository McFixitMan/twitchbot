import { Router } from 'express';
import { queueController } from '../controllers/queueController';

class QueueRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init = (): void => {
        this.router.get('/getAll', queueController.getCurrentQueueItems);
    };
}

const route = new QueueRoute();
const router = route.router;

export { router as queueRoute };