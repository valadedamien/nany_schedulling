import ApiService from './ApiService';
import { WorkDayModel, WorkDayInputModel } from '../models/WorkDayModel';

/**
 * Service pour gérer les jours de travail
 */
export default class WorkDayService {
    /**
     * Récupère les plannings pour un mois spécifique
     *
     * @param year Année
     * @param month Mois (1-12)
     */
    public static async getMonthlyWorkDays(year: number, month: number): Promise<any> {
        return await ApiService.get<any>(`/work_days?year=${year}&month=${month}`);
    }

    /**
     * Récupère un jour de travail par son ID
     */
    public static async getById(id: number): Promise<WorkDayModel> {
        return await ApiService.get<WorkDayModel>(`/work_days/${id}`);
    }

    /**
     * Crée un nouveau jour de travail
     */
    public static async create(workDay: WorkDayInputModel): Promise<WorkDayModel> {
        // Adapter l'IRI pour les relations
        const payload: any = {
            date: workDay.date
        };

        // Conversion en snake_case pour l'API
        if (workDay.workShiftId !== null && workDay.workShiftId !== undefined) {
            if (typeof workDay.workShiftId === 'number') {
                payload.work_shift = `/api/work_shifts/${workDay.workShiftId}`;
            } else {
                payload.work_shift = workDay.workShiftId;
            }
        }

        if (workDay.note !== undefined) {
            payload.note = workDay.note;
        }

        return await ApiService.post<WorkDayModel>('/work_days', payload);
    }

    /**
     * Met à jour un jour de travail existant
     */
    public static async update(id: number, workDay: WorkDayInputModel): Promise<WorkDayModel> {
        // Adapter l'IRI pour les relations
        const payload: any = {
            date: workDay.date
        };

        // Conversion en snake_case pour l'API
        if (workDay.workShiftId !== null && workDay.workShiftId !== undefined) {
            if (typeof workDay.workShiftId === 'number') {
                payload.work_shift = `/api/work_shifts/${workDay.workShiftId}`;
            } else {
                payload.work_shift = workDay.workShiftId;
            }
        }

        if (workDay.note !== undefined) {
            payload.note = workDay.note;
        }

        return await ApiService.patch<WorkDayModel>(`/work_days/${id}`, payload);
    }

    /**
     * Supprime un jour de travail
     */
    public static async delete(id: number): Promise<void> {
        await ApiService.delete<void>(`/work_days/${id}`);
    }

    /**
     * Vérifie si un jour a un planning de travail programmé
     *
     * @param workDays Liste des jours de travail du mois
     * @param date Date à vérifier au format YYYY-MM-DD
     */
    public static hasWorkDay(workDays: WorkDayModel[], date: string): WorkDayModel | undefined {
        return workDays.find(workDay => workDay.date === date);
    }
}
