import { Router } from 'express';
import { predictionController } from '../controllers/predictionController';

class PredictionRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init = (): void => {
        this.router.get('/getActivePrediction', predictionController.getActivePrediction);

        this.router.post('/resolvePrediction', predictionController.resolvePrediction);
        this.router.post('/cancelPrediction', predictionController.cancelPrediction);
    };

}

const route = new PredictionRoute();
const router = route.router;

export { router as predictionRoute };