import ApiService from './ApiService';
import { WorkShiftModel, WorkShiftInputModel } from '../models/WorkShiftModel';

/**
 * Service pour gérer les quarts de travail
 */
export default class WorkShiftService {
  /**
   * Récupère tous les quarts de travail
   */
  public static async getAll(): Promise<WorkShiftModel[]> {
    const response = await ApiService.get<{member: any[]}>('/work_shifts');

    if (response && response.member) {
      return response.member.map(item => this.convertApiToModel(item));
    }

    return [];
  }

  /**
   * Récupère un quart de travail par son ID
   */
  public static async getById(id: number): Promise<WorkShiftModel> {
    const response = await ApiService.get<any>(`/work_shifts/${id}`);
    return this.convertApiToModel(response);
  }

  /**
   * Crée un nouveau quart de travail
   */
  public static async create(workShift: WorkShiftInputModel): Promise<WorkShiftModel> {
    const payload = {
      name: workShift.name,
      color: workShift.color,
      icon: workShift.icon
    };

    const response = await ApiService.post<any>('/work_shifts', payload);
    return this.convertApiToModel(response);
  }

  /**
   * Met à jour un quart de travail existant
   */
  public static async update(id: number, workShift: WorkShiftInputModel): Promise<WorkShiftModel> {
    const payload = {
      name: workShift.name,
      color: workShift.color,
      icon: workShift.icon
    };

    const response = await ApiService.patch<any>(`/work_shifts/${id}`, payload);
    return this.convertApiToModel(response);
  }

  /**
   * Supprime un quart de travail
   */
  public static async delete(id: number): Promise<void> {
    await ApiService.delete<void>(`/work_shifts/${id}`);
  }

  /**
   * Convertit un modèle API en modèle d'application
   */
  private static convertApiToModel(apiModel: any): WorkShiftModel {
    return {
      id: apiModel.id,
      name: apiModel.name,
      color: apiModel.color,
      icon: apiModel.icon
    };
  }
}
