import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../constants/httpStatusCode';
import { createQueueManager } from '../services/queue/queueManager';

class QueueController {
    getCurrentQueueItems = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> =>  {
        const queueManager = await createQueueManager();

        const queueItems = await queueManager.getCurrentQueueItems();

        return res.status(HttpStatusCode.OK)
            .send(queueItems);
    };
}

const queueController = new QueueController();

export { queueController };