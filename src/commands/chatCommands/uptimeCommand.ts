import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class UptimeCommand extends CommandBase<ChatMessage> {
    
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (message: ChatMessage): boolean => {
        return message.message.toLowerCase() === '!uptime';
    };
    
    execute = async (message: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;
        
        const seconds = await apiManager?.getUptimeInSeconds();

        await chatManager.sendMessage(`Stream has been up for ${seconds} seconds`);
    };
    
}