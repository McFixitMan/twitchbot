import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../constants/httpStatusCode';
import { Prediction } from '../services/api/types/prediction';


class PredictionController {
    getActivePrediction = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { apiManager } = res.twitchBot;

        try {
            const currentPrediction = await apiManager.getActivePrediction();

            const prediction: Prediction | undefined = !!currentPrediction
                ?
                {
                    title: currentPrediction?.title,
                    outcome1: currentPrediction?.outcomes[0].title,
                    outcome2: currentPrediction?.outcomes[1].title,
                }
                :
                undefined;
    
            return res
                .status(HttpStatusCode.OK)
                .send(prediction);
        } catch (err) {
            return next(err);
        }
    };

    resolvePrediction = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { apiManager, chatManager } = res.twitchBot;

        const outcome = Number(req.body.outcome);

        if (!outcome || (outcome !== 1 && outcome !== 2)) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send({ message: 'Invalid outcome value' });
        }

        try {
            await apiManager.resolvePrediction(outcome);

            if (outcome === 1) {
                await chatManager.sendMessage(`Good job believers! :)`);
            } else {
                await chatManager.sendMessage(`Doubters suck but in this case they were right :(`);
            }
    
            return res 
                .status(HttpStatusCode.OK)
                .send();
        } catch (err) {
            return next(err);
        }
    };

    cancelPrediction = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { apiManager, chatManager } = res.twitchBot;

        try {
            await apiManager.cancelPrediction();

            await chatManager.sendMessage('Prediction cancelled');

            return res
                .status(HttpStatusCode.OK)
                .send();
        } catch (err) {
            return next(err);
        }
    };
}

const predictionController = new PredictionController();

export { predictionController };