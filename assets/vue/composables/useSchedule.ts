import { ref, computed, Ref } from 'vue';
import DayScheduleService from '../services/DayScheduleService';
import { DayScheduleModel, DayScheduleInputModel, MonthlyScheduleModel } from '../models/DayScheduleModel';

/**
 * Composable pour gérer le planning mensuel
 */
export default function useSchedule() {
    const schedule: Ref<MonthlyScheduleModel | null> = ref(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Date actuelle
    const currentDate = ref(new Date());

    // Année et mois affichés
    const displayYear = ref(currentDate.value.getFullYear());
    const displayMonth = ref(currentDate.value.getMonth() + 1); // getMonth() est 0-indexed

    /**
     * Charge le planning pour un mois spécifique
     */
    /**
     * Charge le planning pour un mois spécifique
     */
    const fetchMonthlySchedule = async (year: number, month: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            displayYear.value = year;
            displayMonth.value = month;
            const response = await DayScheduleService.getMonthlySchedules(year, month);

            // Adapter la réponse JSON-LD au format attendu
            if (response && response.member) {
                schedule.value = {
                    year: year,
                    month: month,
                    days: response.member.map((item) => {
                        // Convertir la date ISO en format YYYY-MM-DD
                        const date = new Date(item.date);
                        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                        // Conversion du time_slot si présent
                        let timeSlot = {};
                        if (item.time_slot) {
                            const timeSlotData = {
                                id: item.time_slot.id || parseInt(item.time_slot['@id'].split('/').pop() || '0'),
                                name: item.time_slot.name,
                                dropOffTime: formatTimeFromISO(item.time_slot.drop_off_time),
                                pickUpTime: formatTimeFromISO(item.time_slot.pick_up_time),
                                color: item.time_slot.color
                            };
                            timeSlot = timeSlotData ?? [];
                        }

                        return {
                            id: item.id,
                            date: formattedDate,
                            timeSlot: timeSlot,
                            customDropOffTime: formatTimeFromISO(item.custom_drop_off_time),
                            customPickUpTime: formatTimeFromISO(item.custom_pick_up_time),
                            note: item.note || null,
                            effectiveDropOffTime: formatTimeFromISO(item.effective_drop_off_time),
                            effectivePickUpTime: formatTimeFromISO(item.effective_pick_up_time)
                        };
                    }),
                    totalScheduledDays: response.totalItems || response.member.length
                };
            } else {
                schedule.value = {
                    year: year,
                    month: month,
                    days: [],
                    totalScheduledDays: 0
                };
            }
        } catch (err) {
            error.value = "Impossible de charger le planning";
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Formate une chaîne de temps ISO en format HH:MM
     */
    const formatTimeFromISO = (isoString: string | null): string | null => {
        if (!isoString) return null;
        try {
            const date = new Date(isoString);
            return date.toTimeString().substring(0, 5); // Extrait HH:MM de HH:MM:SS GMT+...
        } catch (e) {
            console.error('Erreur de formatage de l\'heure:', e);
            return null;
        }
    };

    /**
     * Change le mois affiché
     *
     * @param delta Nombre de mois à ajouter/soustraire
     */
    const changeMonth = async (delta: number) => {
        let newMonth = displayMonth.value + delta;
        let newYear = displayYear.value;

        if (newMonth < 1) {
            newMonth += 12;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth -= 12;
            newYear += 1;
        }

        await fetchMonthlySchedule(newYear, newMonth);
    };

    /**
     * Revient au mois actuel
     */
    const goToCurrentMonth = async () => {
        const now = new Date();
        await fetchMonthlySchedule(now.getFullYear(), now.getMonth() + 1);
    };

    /**
     * Crée un nouveau planning journalier
     */
    const createDaySchedule = async (daySchedule: DayScheduleInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            // Le timeSlotId sera transformé en IRI dans le service
            const newSchedule = await DayScheduleService.create(daySchedule);

            // Recharger le planning après création
            await fetchMonthlySchedule(displayYear.value, displayMonth.value);

            return newSchedule;
        } catch (err) {
            error.value = "Impossible de créer le planning";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Met à jour un planning journalier existant
     */
    const updateDaySchedule = async (id: number, daySchedule: DayScheduleInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const updatedSchedule = await DayScheduleService.update(id, daySchedule);

            // Recharger le planning après mise à jour
            await fetchMonthlySchedule(displayYear.value, displayMonth.value);

            return updatedSchedule;
        } catch (err) {
            error.value = "Impossible de mettre à jour le planning";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Supprime un planning journalier
     */
    const deleteDaySchedule = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            await DayScheduleService.delete(id);

            // Recharger le planning après suppression
            await fetchMonthlySchedule(displayYear.value, displayMonth.value);
        } catch (err) {
            error.value = "Impossible de supprimer le planning";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Obtient le planning pour une date donnée
     */
    const getDaySchedule = (date: string): DayScheduleModel | undefined => {
        if (!schedule.value) return undefined;
        return schedule.value.days.find(day => day.date === date);
    };

    interface CalendarDay {
        date: string;
        day: number;
        isCurrentMonth: boolean;
        isToday: boolean;
        schedule: DayScheduleModel | undefined;
    }

    /**
     * Génère les jours du mois actuel
     */
    const daysInMonth = computed<CalendarDay[]>(() => {
        if (!displayYear.value || !displayMonth.value) return [];

        const year = displayYear.value;
        const month = displayMonth.value;

        // Nombre de jours dans le mois
        const daysCount = new Date(year, month, 0).getDate();

        // Premier jour du mois (0 = Dimanche, 1 = Lundi, etc.)
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

        // Conversion pour commencer la semaine le lundi (0 = Lundi, 6 = Dimanche)
        const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const days: CalendarDay[] = [];

        // Jours du mois précédent pour compléter la première semaine
        const prevMonthDays = startingDay;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevMonthYear = month === 1 ? year - 1 : year;
        const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();

        for (let i = 0; i < prevMonthDays; i++) {
            const day = daysInPrevMonth - prevMonthDays + i + 1;
            const date = `${prevMonthYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({
                date,
                day,
                isCurrentMonth: false,
                isToday: false,
                schedule: undefined
            });
        }

        // Jours du mois courant
        const today = new Date();
        const isCurrentYearAndMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

        for (let i = 1; i <= daysCount; i++) {
            const date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date,
                day: i,
                isCurrentMonth: true,
                isToday: isCurrentYearAndMonth && today.getDate() === i,
                schedule: getDaySchedule(date)
            });
        }

        // Jours du mois suivant pour compléter la dernière semaine
        const totalDaysShown = Math.ceil((startingDay + daysCount) / 7) * 7;
        const nextMonthDays = totalDaysShown - prevMonthDays - daysCount;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextMonthYear = month === 12 ? year + 1 : year;

        for (let i = 1; i <= nextMonthDays; i++) {
            const date = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date,
                day: i,
                isCurrentMonth: false,
                isToday: false,
                schedule: undefined
            });
        }

        return days;
    });

    /**
     * Format du mois affiché (ex: Février 2024)
     */
    const formattedMonth = computed(() => {
        if (!displayYear.value || !displayMonth.value) return '';

        const date = new Date(displayYear.value, displayMonth.value - 1, 1);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    });

    return {
        schedule,
        isLoading,
        error,
        displayYear,
        displayMonth,
        daysInMonth,
        formattedMonth,
        fetchMonthlySchedule,
        changeMonth,
        goToCurrentMonth,
        createDaySchedule,
        updateDaySchedule,
        deleteDaySchedule,
        getDaySchedule
    };
}
