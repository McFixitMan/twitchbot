import * as chalk from 'chalk';

import { PubSubBitsMessage, PubSubClient, PubSubListener, PubSubRedemptionMessage, PubSubSubscriptionMessage, PubSubWhisperMessage } from '@twurple/pubsub';

import { AuthProvider } from '@twurple/auth/lib';
import { SelfDetectedMessage } from '../../types';

export type PubSubListenerType = 'redemption' | 'subscription' | 'bits' | 'whisper';

export type BitMessage = SelfDetectedMessage<PubSubBitsMessage>;
export type RedemptionMessage = SelfDetectedMessage<PubSubRedemptionMessage>;
export type SubMessage = SelfDetectedMessage<PubSubSubscriptionMessage>;
export type WhisperMessage = SelfDetectedMessage<PubSubWhisperMessage>;

export interface PubSubManagerProps {
    onRedemption?: (message: RedemptionMessage) => void;
    onSubscription?: (message: SubMessage) => void;
    onBits?: (message: BitMessage) => void;
    onWhisper?: (message: WhisperMessage) => void;
}

export class PubSubManager {
    public pubSubClient: PubSubClient;
    public listeners: Partial<Record<PubSubListenerType, PubSubListener>> = {};

    private _userId = '';
    private _props: PubSubManagerProps = {};

    constructor() {
        this.pubSubClient = new PubSubClient();
    }

    initialize = async (authProvider: AuthProvider, props?: PubSubManagerProps): Promise<string> => {
        this._props = props ?? {};
        this._userId = await this.pubSubClient.registerUserListener(authProvider);

        await this.configureListeners();  
        
        return this._userId;
    };

    private configureListeners = async (): Promise<void> => {
        // Lets only configure listeners for events that have been assigned handlers
        
        if (!!this._props.onRedemption) {
            this.listeners.redemption = await this.pubSubClient.onRedemption(this._userId, (message) => {
                let fromId = '';

                try {
                    fromId = message.userId;
                } catch (err) {
                    return;
                }

                const selfMessage = this.convertToSelfDetectedMessage(message, fromId);
                
                this._props.onRedemption?.(selfMessage);
            });
        }

        if (!!this._props.onSubscription) {
            this.listeners.subscription = await this.pubSubClient.onSubscription(this._userId, (message) => {
                let fromId = '';

                try {
                    fromId = (!!message.isGift ? message.gifterId : message.userId) ?? message.userId;
                } catch (err) {
                    return;
                }

                const selfMessage = this.convertToSelfDetectedMessage(message, fromId);

                this._props.onSubscription?.(selfMessage);
            });
        }

        if (!!this._props.onBits) {
            this.listeners.bits = await this.pubSubClient.onBits(this._userId, (message) => {
                let fromId = '';

                try {
                    fromId = message.userId ?? '';
                } catch (err) {
                    return;
                }

                const selfMessage = this.convertToSelfDetectedMessage(message, fromId);

                this._props.onBits?.(selfMessage);
            });
        }

        if (!!this._props.onWhisper) {
            this.listeners.whisper = await this.pubSubClient.onWhisper(this._userId, (message) => {
                let fromId = '';

                try {
                    fromId = message.senderId;
                } catch (err) {
                    return;
                }

                const selfMessage = this.convertToSelfDetectedMessage(message, fromId);

                this._props.onWhisper?.(selfMessage);
            });
        }
    };

    private convertToSelfDetectedMessage = <T>(message: T, senderId: string): SelfDetectedMessage<T> => {
        const s = message as SelfDetectedMessage<T>;
        s.isSelf = senderId === this._userId;

        return s;
    };

    cleanup = async (): Promise<void> => {
        Object.entries(this.listeners).forEach(
            ([key, value]) => {
                console.log(`Cleaning up ${key} listener...`);

                if (!!value) {
                    value.remove();
                    console.log(`${key} listener removed.`);
                } else {
                    console.log(`No listener for '${key}' exists, skipping.`);
                }

                console.log('');
            }
        );
    };
}

export const createPubSub = async (authProvider: AuthProvider, props?: PubSubManagerProps): Promise<PubSubManager> => {
    if (!authProvider) {
        throw new Error('Auth provider must be initialized before creating pubSubManager');
    }

    const pubSubManager = new PubSubManager();

    await pubSubManager.initialize(authProvider, props);

    console.info(chalk.blue(`🔄 PubSubManager initialized! Now listening to handled events: [${Object.entries(pubSubManager.listeners).map(([key, value]) => key).join(', ')}]...`));

    return pubSubManager;
};
