import { ref, computed, Ref } from 'vue';
import WorkDayService from '../services/WorkDayService';
import { WorkDayModel, WorkDayInputModel, MonthlyWorkScheduleModel } from '../models/WorkDayModel';

/**
 * Composable pour gérer le planning de travail mensuel
 */
export default function useWorkDays() {
    const workSchedule: Ref<MonthlyWorkScheduleModel | null> = ref(null);
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
    const fetchMonthlyWorkDays = async (year: number, month: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            displayYear.value = year;
            displayMonth.value = month;
            const response = await WorkDayService.getMonthlyWorkDays(year, month);

            // Adapter la réponse JSON-LD au format attendu
            if (response && response.member) {
                workSchedule.value = {
                    year: year,
                    month: month,
                    days: response.member.map((item: any) => {
                        // Convertir la date ISO en format YYYY-MM-DD
                        const date = new Date(item.date);
                        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                        // Conversion du work_shift si présent
                        let workShift = {};
                        if (item.work_shift) {
                            workShift = {
                                id: item.work_shift.id || parseInt(item.work_shift['@id'].split('/').pop() || '0'),
                                name: item.work_shift.name,
                                color: item.work_shift.color,
                                icon: item.work_shift.icon
                            };
                        }

                        return {
                            id: item.id,
                            date: formattedDate,
                            workShift: workShift,
                            note: item.note || null
                        };
                    }),
                    totalWorkDays: response.totalItems || response.member.length
                };
            } else {
                workSchedule.value = {
                    year: year,
                    month: month,
                    days: [],
                    totalWorkDays: 0
                };
            }
        } catch (err) {
            error.value = "Impossible de charger le planning de travail";
            console.error(err);
        } finally {
            isLoading.value = false;
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

        await fetchMonthlyWorkDays(newYear, newMonth);
    };

    /**
     * Revient au mois actuel
     */
    const goToCurrentMonth = async () => {
        const now = new Date();
        await fetchMonthlyWorkDays(now.getFullYear(), now.getMonth() + 1);
    };

    /**
     * Crée un nouveau jour de travail
     */
    const createWorkDay = async (workDay: WorkDayInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const newWorkDay = await WorkDayService.create(workDay);

            // Recharger le planning après création
            await fetchMonthlyWorkDays(displayYear.value, displayMonth.value);

            return newWorkDay;
        } catch (err) {
            error.value = "Impossible de créer le jour de travail";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Met à jour un jour de travail existant
     */
    const updateWorkDay = async (id: number, workDay: WorkDayInputModel) => {
        isLoading.value = true;
        error.value = null;

        try {
            const updatedWorkDay = await WorkDayService.update(id, workDay);

            // Recharger le planning après mise à jour
            await fetchMonthlyWorkDays(displayYear.value, displayMonth.value);

            return updatedWorkDay;
        } catch (err) {
            error.value = "Impossible de mettre à jour le jour de travail";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Supprime un jour de travail
     */
    const deleteWorkDay = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            await WorkDayService.delete(id);

            // Recharger le planning après suppression
            await fetchMonthlyWorkDays(displayYear.value, displayMonth.value);
        } catch (err) {
            error.value = "Impossible de supprimer le jour de travail";
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Obtient le planning pour une date donnée
     */
    const getWorkDay = (date: string): WorkDayModel | undefined => {
        if (!workSchedule.value) return undefined;
        return workSchedule.value.days.find(day => day.date === date);
    };

    interface CalendarDay {
        date: string;
        day: number;
        isCurrentMonth: boolean;
        isToday: boolean;
        workDay: WorkDayModel | undefined;
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
                workDay: getWorkDay(date)
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
                workDay: getWorkDay(date)
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
                workDay: getWorkDay(date)
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
        workSchedule,
        isLoading,
        error,
        displayYear,
        displayMonth,
        daysInMonth,
        formattedMonth,
        fetchMonthlyWorkDays,
        changeMonth,
        goToCurrentMonth,
        createWorkDay,
        updateWorkDay,
        deleteWorkDay,
        getWorkDay
    };
}
