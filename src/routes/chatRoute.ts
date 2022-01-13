import { Router } from 'express';
import { chatController } from '../controllers/chatController';

class ChatRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init = (): void => {
        this.router.get('/getChatters', chatController.getChatters);
        
        this.router.post('/sendChatMessage', chatController.sendChatMessage);

    };
}

const route = new ChatRoute();
const router = route.router;

export { router as chatRoute };