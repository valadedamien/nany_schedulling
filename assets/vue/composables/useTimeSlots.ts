import { ref, computed, onMounted, Ref } from 'vue';
import TimeSlotService from '../services/TimeSlotService';
import { TimeSlotModel, TimeSlotInputModel } from '../models/TimeSlotModel';

/**
 * Composable pour gérer les créneaux horaires
 */
export default function useTimeSlots() {
    const timeSlots: Ref<TimeSlotModel[]> = ref([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Charge tous les créneaux horaires
     */
    const fetchTimeSlots = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            timeSlots.value = (await TimeSlotService.getAll());
        } catch (err) {
            error.value = "Impossible de charger les créneaux horaires";
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Ajoute un nouveau créneau horaire
     */
    const addTimeSlot = async (timeSlot: TimeSlotInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const newTimeSlot = await TimeSlotService.create(timeSlot);
            timeSlots.value.push(newTimeSlot);
            return newTimeSlot;
        } catch (err) {
            error.value = "Impossible d'ajouter le créneau horaire";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Met à jour un créneau horaire existant
     */
    const updateTimeSlot = async (id: number, timeSlot: TimeSlotInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const updatedTimeSlot = await TimeSlotService.update(id, timeSlot);
            const index = timeSlots.value.findIndex(ts => ts.id === id);

            if (index !== -1) {
                timeSlots.value[index] = updatedTimeSlot;
            }

            return updatedTimeSlot;
        } catch (err) {
            error.value = "Impossible de mettre à jour le créneau horaire";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Supprime un créneau horaire
     */
    const deleteTimeSlot = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            await TimeSlotService.delete(id);
            timeSlots.value = timeSlots.value.filter(ts => ts.id !== id);
        } catch (err) {
            error.value = "Impossible de supprimer le créneau horaire";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Trouve un créneau horaire par son ID
     */
    const findTimeSlotById = (id: number | null) => {
        if (id === null) return null;
        return timeSlots.value.find(ts => ts.id === id) || null;
    };

    /**
     * Crée un tableau de couleurs pour les créneaux horaires
     */
    const timeSlotColorMap = computed(() => {
        const colorMap: Record<number, string> = {};
        timeSlots.value.forEach(ts => {
            colorMap[ts.id] = ts.color;
        });
        return colorMap;
    });

    // Charger les créneaux horaires au montage du composant
    onMounted(fetchTimeSlots);

    return {
        timeSlots,
        isLoading,
        error,
        fetchTimeSlots,
        addTimeSlot,
        updateTimeSlot,
        deleteTimeSlot,
        findTimeSlotById,
        timeSlotColorMap
    };
}
