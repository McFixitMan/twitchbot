import { Mm2User } from './mm2User';

export interface Mm2LevelInfo {
    attempts: number;
    boos: number;
    clear_condition_magnitude: number;
    clear_condition_name?: string;
    clear_rate: string;
    clears: number;
    description: string;
    difficulty_name: string;
    first_completer: Mm2User;
    game_style_name: string;
    likes: number;
    name: string;
    num_comments: number;
    plays: number;
    record_holder: Mm2User;
    tags_name: Array<string>;
    theme_name: string;
    upload_time_pretty: string;
    uploaded_pretty: string;
    uploader: Mm2User;
    world_record_pretty: string;
} 