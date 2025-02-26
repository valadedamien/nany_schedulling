import ApiService from './ApiService';
import { TimeSlotModel, TimeSlotInputModel, ApiTimeSlotModel } from '../models/TimeSlotModel';

/**
 * Service pour gérer les créneaux horaires prédéfinis
 */
export default class TimeSlotService {
    /**
     * Récupère tous les créneaux horaires
     */
    public static async getAll(): Promise<TimeSlotModel[]> {
        const response = await ApiService.get<{member: ApiTimeSlotModel[]}>('/time_slots');

        if (response && response.member) {
            return response.member.map(item => this.convertApiToModel(item));
        }

        return [];
    }

    /**
     * Récupère un créneau horaire par son ID
     */
    public static async getById(id: number): Promise<TimeSlotModel> {
        const response = await ApiService.get<ApiTimeSlotModel>(`/time_slots/${id}`);
        return this.convertApiToModel(response);
    }

    /**
     * Crée un nouveau créneau horaire
     */
    public static async create(timeSlot: TimeSlotInputModel): Promise<TimeSlotModel> {
        const payload = {
            name: timeSlot.name,
            drop_off_time: timeSlot.dropOffTime,
            pick_up_time: timeSlot.pickUpTime,
            color: timeSlot.color
        };

        const response = await ApiService.post<ApiTimeSlotModel>('/time_slots', payload);
        return this.convertApiToModel(response);
    }

    /**
     * Met à jour un créneau horaire existant
     */
    public static async update(id: number, timeSlot: TimeSlotInputModel): Promise<TimeSlotModel> {
        const payload = {
            name: timeSlot.name,
            drop_off_time: timeSlot.dropOffTime,
            pick_up_time: timeSlot.pickUpTime,
            color: timeSlot.color
        };

        const response = await ApiService.put<ApiTimeSlotModel>(`/time_slots/${id}`, payload);
        return this.convertApiToModel(response);
    }

    /**
     * Supprime un créneau horaire
     */
    public static async delete(id: number): Promise<void> {
        await ApiService.delete<void>(`/time_slots/${id}`);
    }

    /**
     * Convertit un modèle API en modèle d'application
     */
    private static convertApiToModel(apiModel: ApiTimeSlotModel): TimeSlotModel {
        return {
            id: apiModel.id,
            name: apiModel.name,
            dropOffTime: this.formatTimeFromISO(apiModel.drop_off_time),
            pickUpTime: this.formatTimeFromISO(apiModel.pick_up_time),
            color: apiModel.color
        };
    }

    /**
     * Formate une chaîne de temps ISO en format HH:MM
     */
    private static formatTimeFromISO(isoString: string): string {
        try {
            const date = new Date(isoString);
            return date.toTimeString().substring(0, 5); // Extrait HH:MM de HH:MM:SS GMT+...
        } catch (e) {
            console.error('Erreur de formatage de l\'heure:', e);
            return '--:--';
        }
    }
}
