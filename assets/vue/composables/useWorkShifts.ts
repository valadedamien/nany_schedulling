import { ref, computed, onMounted, Ref } from 'vue';
import WorkShiftService from '../services/WorkShiftService';
import { WorkShiftModel, WorkShiftInputModel } from '../models/WorkShiftModel';

/**
 * Composable pour gérer les quarts de travail
 */
export default function useWorkShifts() {
    const workShifts: Ref<WorkShiftModel[]> = ref([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Charge tous les quarts de travail
     */
    const fetchWorkShifts = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            workShifts.value = await WorkShiftService.getAll();
        } catch (err) {
            error.value = "Impossible de charger les quarts de travail";
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Ajoute un nouveau quart de travail
     */
    const addWorkShift = async (workShift: WorkShiftInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const newWorkShift = await WorkShiftService.create(workShift);
            workShifts.value.push(newWorkShift);
            return newWorkShift;
        } catch (err) {
            error.value = "Impossible d'ajouter le quart de travail";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Met à jour un quart de travail existant
     */
    const updateWorkShift = async (id: number, workShift: WorkShiftInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const updatedWorkShift = await WorkShiftService.update(id, workShift);
            const index = workShifts.value.findIndex(ws => ws.id === id);

            if (index !== -1) {
                workShifts.value[index] = updatedWorkShift;
            }

            return updatedWorkShift;
        } catch (err) {
            error.value = "Impossible de mettre à jour le quart de travail";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Supprime un quart de travail
     */
    const deleteWorkShift = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            await WorkShiftService.delete(id);
            workShifts.value = workShifts.value.filter(ws => ws.id !== id);
        } catch (err) {
            error.value = "Impossible de supprimer le quart de travail";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Trouve un quart de travail par son ID
     */
    const findWorkShiftById = (id: number | null) => {
        if (id === null) return null;
        return workShifts.value.find(ws => ws.id === id) || null;
    };

    /**
     * Crée un tableau de couleurs pour les quarts de travail
     */
    const workShiftColorMap = computed(() => {
        const colorMap: Record<number, string> = {};
        workShifts.value.forEach(ws => {
            colorMap[ws.id] = ws.color;
        });
        return colorMap;
    });

    // Charger les quarts de travail au montage du composant
    onMounted(fetchWorkShifts);

    return {
        workShifts,
        isLoading,
        error,
        fetchWorkShifts,
        addWorkShift,
        updateWorkShift,
        deleteWorkShift,
        findWorkShiftById,
        workShiftColorMap
    };
}
