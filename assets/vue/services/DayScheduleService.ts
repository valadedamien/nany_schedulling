import ApiService from './ApiService';
import { DayScheduleModel, DayScheduleInputModel, MonthlyScheduleModel } from '../models/DayScheduleModel';

/**
 * Service pour gérer les plannings journaliers
 */
export default class DayScheduleService {
    /**
     * Récupère les plannings pour un mois spécifique
     *
     * @param year Année
     * @param month Mois (1-12)
     */
    public static async getMonthlySchedules(year: number, month: number): Promise<any> {
        return await ApiService.get<any>(`/day_schedules?year=${year}&month=${month}`);
    }

    /**
     * Récupère un planning journalier par son ID
     */
    public static async getById(id: number): Promise<DayScheduleModel> {
        return await ApiService.get<DayScheduleModel>(`/day_schedules/${id}`);
    }

    /**
     * Crée un nouveau planning journalier
     */
    public static async create(daySchedule: DayScheduleInputModel): Promise<DayScheduleModel> {
        // Adapter l'IRI pour les relations
        const payload: any = {
            date: daySchedule.date
        };

        // Conversion en snake_case pour l'API
        if (daySchedule.timeSlotId !== null && daySchedule.timeSlotId !== undefined) {
            if (typeof daySchedule.timeSlotId === 'number') {
                payload.time_slot = `/api/time_slots/${daySchedule.timeSlotId}`;
            } else {
                payload.time_slot = daySchedule.timeSlotId;
            }
        }

        if (daySchedule.custom_drop_off_time) {
            payload.custom_drop_off_time = daySchedule.custom_drop_off_time;
        }

        if (daySchedule.custom_pick_up_time) {
            payload.custom_pick_up_time = daySchedule.custom_pick_up_time;
        }

        if (daySchedule.note !== undefined) {
            payload.note = daySchedule.note;
        }

        return await ApiService.post<DayScheduleModel>('/day_schedules', payload);
    }

    /**
     * Met à jour un planning journalier existant
     */
    public static async update(id: number, daySchedule: DayScheduleInputModel): Promise<DayScheduleModel> {
        // Adapter l'IRI pour les relations
        const payload: any = {
            date: daySchedule.date
        };

        // Conversion en snake_case pour l'API
        if (daySchedule.timeSlotId !== null && daySchedule.timeSlotId !== undefined) {
            if (typeof daySchedule.timeSlotId === 'number') {
                payload.time_slot = `/api/time_slots/${daySchedule.timeSlotId}`;
            } else {
                payload.time_slot = daySchedule.timeSlotId;
            }
        }

        if (daySchedule.custom_drop_off_time) {
            payload.custom_drop_off_time = daySchedule.custom_drop_off_time;
        }

        if (daySchedule.custom_pick_up_time) {
            payload.custom_pick_up_time = daySchedule.custom_pick_up_time;
        }

        if (daySchedule.note !== undefined) {
            payload.note = daySchedule.note;
        }

        return await ApiService.put<DayScheduleModel>(`/day_schedules/${id}`, payload);
    }
    /**
     * Supprime un planning journalier
     */
    public static async delete(id: number): Promise<void> {
        await ApiService.delete<void>(`/day_schedules/${id}`);
    }

    /**
     * Vérifie si un jour a un planning programmé
     *
     * @param schedules Liste des plannings du mois
     * @param date Date à vérifier au format YYYY-MM-DD
     */
    public static hasSchedule(schedules: DayScheduleModel[], date: string): DayScheduleModel | undefined {
        return schedules.find(schedule => schedule.date === date);
    }

    /**
     * Formate une heure au format HH:MM
     *
     * @param time Heure (peut être null)
     * @param defaultValue Valeur par défaut si l'heure est null
     */
    public static formatTime(time: string | null, defaultValue: string = '--:--'): string {
        return time || defaultValue;
    }
}
