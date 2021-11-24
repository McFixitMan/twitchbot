export type SelfDetectedMessage<T> = T & {
    isSelf?: boolean;
}