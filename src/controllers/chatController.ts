import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../constants/httpStatusCode';

class ChatController {
    sendChatMessage = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager } = res.twitchBot;

        const message = req.body.message;

        try {
            await chatManager.sendMessage(message);

            return res.send(HttpStatusCode.OK);
        } catch (err) {
            return next(err);
        }
        
    };
}

const chatController = new ChatController();

export { chatController };