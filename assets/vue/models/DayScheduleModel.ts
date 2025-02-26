import { TimeSlotModel } from './TimeSlotModel';

/**
 * Interface représentant la structure API des données (en snake_case)
 */
export interface ApiDayScheduleModel {
    id: number;
    date: string;
    time_slot?: {
        '@id': string;
        '@type': string;
        name: string;
        drop_off_time: string;
        pick_up_time: string;
        color: string;
        id: number;
    } | null;
    custom_drop_off_time: string | null;
    custom_pick_up_time: string | null;
    note?: string | null;
    created_at: string;
    updated_at: string;
    effective_drop_off_time: string | null;
    effective_pick_up_time: string | null;
}

/**
 * Modèle représentant un planning journalier normalisé pour l'application
 */
export interface DayScheduleModel {
    id: number;
    date: string; // Format: YYYY-MM-DD
    timeSlot: TimeSlotModel | null;
    customDropOffTime: string | null; // Format: HH:MM
    customPickUpTime: string | null; // Format: HH:MM
    note: string | null;
    effectiveDropOffTime: string | null; // Format: HH:MM
    effectivePickUpTime: string | null; // Format: HH:MM
}

/**
 * Modèle représentant les données d'entrée pour créer ou mettre à jour un planning
 */
export interface DayScheduleInputModel {
    date: string; // Format: YYYY-MM-DD
    timeSlotId?: number | string | null;
    custom_drop_off_time?: string | null; // Format: HH:MM (snake_case pour API)
    custom_pick_up_time?: string | null; // Format: HH:MM (snake_case pour API)
    note?: string | null;
    time_slot?: string; // Format IRI pour API Platform
}

/**
 * Modèle représentant les plannings d'un mois complet
 */
export interface MonthlyScheduleModel {
    year: number;
    month: number;
    days: DayScheduleModel[];
    totalScheduledDays: number;
}

/**
 * Représentation de la réponse JSON-LD d'API Platform
 */
export interface ApiPlatformResponse {
    '@context'?: string;
    '@id'?: string;
    '@type'?: string;
    'totalItems'?: number;
    'member'?: ApiDayScheduleModel[];
    'view'?: {
        '@id': string;
        '@type': string;
    };
}
