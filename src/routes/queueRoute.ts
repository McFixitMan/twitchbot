import { Router } from 'express';
import { queueController } from '../controllers/queueController';

class QueueRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init = (): void => {
        this.router.get('/getCurrentQueue', queueController.getCurrentQueue);
        this.router.get('/getCurrentQueueItems', queueController.getCurrentQueueItems);
        this.router.get('/getCurrentLevel', queueController.getCurrentLevel);
        this.router.get('/getQueueRecord', queueController.getQueueRecord);
        this.router.get('/getBotState', queueController.getBotState);
        this.router.get('/getMm2LevelInfoByCode/:code', queueController.getMm2LevelInfoByCode);
        this.router.get('/getMm2UserInfoByCode/:code', queueController.getMm2UserInfoByCode);

        this.router.post('/setCurrentLevel', queueController.setCurrentLevel);
        this.router.post('/winCurrentLevel', queueController.winCurrentLevel);
        this.router.post('/loseCurrentLevel', queueController.loseCurrentLevel);
        this.router.post('/setNextLevel', queueController.setNextLevel);
        this.router.post('/setRandomLevel', queueController.setRandomLevel);
        this.router.post('/setWeightedRandomLevel', queueController.setWeightedRandomLevel);
        this.router.post('/setSubNextLevel', queueController.setSubNextLevel);
        this.router.post('/setSubRandomLevel', queueController.setSubRandomLevel);
        this.router.post('/removeCurrentLevel', queueController.removeCurrentLevel);
        this.router.post('/unselectCurrentLevel', queueController.unselectCurrentLevel);
        this.router.post('/reQueueCurrentLevel', queueController.reQueueCurrentLevel);
        this.router.post('/closeQueue', queueController.closeQueue);
        this.router.post('/openQueue', queueController.openQueue);
        this.router.post('/createQueue', queueController.createQueue);
        this.router.post('/loadLastQueue', queueController.loadLastQueue);
    };
}

const route = new QueueRoute();
const router = route.router;

export { router as queueRoute };