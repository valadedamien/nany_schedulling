import { WorkShiftModel } from './WorkShiftModel';

/**
 * Interface représentant la structure API des données (en snake_case)
 */
export interface ApiWorkDayModel {
    id: number;
    date: string;
    work_shift?: {
        '@id': string;
        '@type': string;
        name: string;
        color: string;
        icon: string | null;
        id: number;
    } | null;
    note?: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Modèle représentant un jour de travail normalisé pour l'application
 */
export interface WorkDayModel {
    id: number;
    date: string; // Format: YYYY-MM-DD
    workShift: WorkShiftModel | null;
    note: string | null;
}

/**
 * Modèle représentant les données d'entrée pour créer ou mettre à jour un jour de travail
 */
export interface WorkDayInputModel {
    date: string; // Format: YYYY-MM-DD
    workShiftId?: number | string | null;
    note?: string | null;
    work_shift?: string; // Format IRI pour API Platform
}

/**
 * Modèle représentant les jours de travail d'un mois complet
 */
export interface MonthlyWorkScheduleModel {
    year: number;
    month: number;
    days: WorkDayModel[];
    totalWorkDays: number;
}
