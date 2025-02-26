<template>
  <div class="calendar">
    <!-- En-tête du calendrier -->
    <div class="calendar-header flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <button
            type="button"
            class="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
            @click="changeMonth(-1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <h2 class="text-xl font-semibold capitalize">{{ formattedMonth }}</h2>
        <button
            type="button"
            class="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
            @click="changeMonth(1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <button
            type="button"
            class="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
            @click="goToCurrentMonth"
        >
          Aujourd'hui
        </button>
        <button
            type="button"
            class="px-3 py-1 text-sm rounded-md bg-green-100 text-green-700 hover:bg-green-200"
            @click="openPrintView"
        >
          Imprimer
        </button>
      </div>
    </div>

    <!-- Grille du calendrier -->
    <div class="calendar-grid">
      <!-- Jours de la semaine -->
      <div class="calendar-weekdays grid grid-cols-7 mb-2">
        <div
            v-for="day in weekDays"
            :key="day"
            class="text-center font-medium py-2 text-gray-500"
        >
          {{ day }}
        </div>
      </div>

      <!-- Jours du mois -->
      <div
          class="calendar-days grid grid-cols-7 gap-1"
          :class="{ 'opacity-50': isLoading }"
      >
        <div
            v-for="day in daysInMonth"
            :key="day.date"
            class="calendar-day relative h-28 border rounded-md overflow-hidden"
            :class="[
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                day.isToday ? 'border-blue-500 border-2' : 'border-gray-200',
                { 'cursor-pointer': day.isCurrentMonth }
            ]"
            @click="day.isCurrentMonth && openDayModal(day.date, day.schedule, getWorkDayForDate(day.date))"
        >
          <!-- Header section for day number and workshift badge -->
          <div class="day-header flex justify-between items-center px-1 pt-1">
            <!-- Numéro du jour -->
            <div
                class="day-number w-6 h-6 flex items-center justify-center rounded-full text-sm"
                :class="day.isToday ? 'bg-blue-500 text-white' : 'text-gray-700'"
            >
              {{ day.day }}
            </div>

            <!-- Badge WorkShift si présent -->
            <div
                v-if="getWorkDayForDate(day.date)"
                class="work-shift-badge"
            >
              <div
                  class="h-6 p-4 flex items-center justify-center rounded-full text-xs text-white"
                  :style="{ backgroundColor: getWorkShiftColor(getWorkDayForDate(day.date)) }"
                  :title="getWorkShiftName(getWorkDayForDate(day.date))"
              >
                {{ getWorkDayForDate(day.date)?.workShift?.name }}
              </div>
            </div>
          </div>

          <!-- Planning du jour avec plus d'espace en haut -->
          <div
              v-if="day.schedule"
              class="day-schedule mx-1 p-1 rounded text-xs mt-3"
              :style="{ backgroundColor: getScheduleColor(day.schedule) }"
          >
            <div class="font-semibold text-center">
              {{ day.schedule.timeSlot?.name || 'Horaire personnalisé' }}
            </div>
            <div class="flex justify-between mt-1">
              <span>Dépôt: {{ formatTime(day.schedule.effectiveDropOffTime) }}</span>
              <span>Récup: {{ formatTime(day.schedule.effectivePickUpTime) }}</span>
            </div>
            <div v-if="day.schedule.note" class="mt-1 text-xs italic truncate">
              {{ day.schedule.note }}
            </div>
          </div>

          <!-- Indicateur de jour vide -->
          <div
              v-else-if="day.isCurrentMonth && !getWorkDayForDate(day.date)"
              class="day-empty flex items-center justify-center h-full text-gray-400 text-xs italic"
          >
            <span>Cliquez pour ajouter</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale unifiée pour gérer planning et quart de travail -->
    <DayModal
        v-if="showDayModal"
        :date="selectedDate"
        :schedule="selectedSchedule"
        :time-slots="timeSlots"
        :work-day="selectedWorkDay"
        :work-shifts="workShifts"
        @close="showDayModal = false"
        @save="handleSave"
        @delete="handleDelete"
    />

    <!-- Vue d'impression -->
    <div v-if="showPrintView" class="print-view-container">
      <PrintableSchedule
          :year="displayYear"
          :month="displayMonth"
          :days="daysInMonth.filter(d => d.isCurrentMonth && d.schedule)"
          @close="closePrintView"
      />
    </div>

    <!-- Message de chargement -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2">Chargement...</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import useSchedule from '../../composables/useSchedule';
import useTimeSlots from '../../composables/useTimeSlots';
import useWorkShifts from '../../composables/useWorkShifts';
import useWorkDays from '../../composables/useWorkDays';
import { DayScheduleModel, DayScheduleInputModel } from '../../models/DayScheduleModel';
import { WorkDayModel, WorkDayInputModel } from '../../models/WorkDayModel';
import DayModal from './DayModal.vue';
import PrintableSchedule from './PrintableSchedule.vue';

export default defineComponent({
  name: 'Calendar',
  components: {
    DayModal,
    PrintableSchedule
  },
  setup() {
    // Initialisation des composables
    const {
      isLoading: scheduleLoading,
      formattedMonth,
      daysInMonth,
      displayYear,
      displayMonth,
      fetchMonthlySchedule,
      changeMonth: changeScheduleMonth,
      goToCurrentMonth: goToCurrentScheduleMonth,
      createDaySchedule,
      updateDaySchedule,
      deleteDaySchedule: deleteSchedule
    } = useSchedule();

    const {
      isLoading: workDaysLoading,
      fetchMonthlyWorkDays,
      createWorkDay,
      updateWorkDay,
      deleteWorkDay: deleteWork,
      getWorkDay
    } = useWorkDays();

    const { timeSlots } = useTimeSlots();
    const { workShifts } = useWorkShifts();

    // État de la modale
    const showDayModal = ref(false);
    const selectedDate = ref('');
    const selectedSchedule = ref<DayScheduleModel | undefined>(undefined);
    const selectedWorkDay = ref<WorkDayModel | undefined>(undefined);

    // État de la vue d'impression
    const showPrintView = ref(false);

    // Jours de la semaine
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // État de chargement combiné
    const isLoading = computed(() => scheduleLoading.value || workDaysLoading.value);

    // Charger les plannings au montage du composant
    onMounted(async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      await fetchMonthlySchedule(year, month);
      await fetchMonthlyWorkDays(year, month);
    });

    // Changer de mois
    const changeMonth = async (delta: number) => {
      await changeScheduleMonth(delta);
      await fetchMonthlyWorkDays(displayYear.value, displayMonth.value);
    };

    // Aller au mois actuel
    const goToCurrentMonth = async () => {
      await goToCurrentScheduleMonth();
      const now = new Date();
      await fetchMonthlyWorkDays(now.getFullYear(), now.getMonth() + 1);
    };

    // Ouvrir la modale unifiée
    const openDayModal = (date: string, schedule?: DayScheduleModel, workDay?: WorkDayModel) => {
      selectedDate.value = date;
      selectedSchedule.value = schedule;
      selectedWorkDay.value = workDay;
      showDayModal.value = true;
    };

    const handleSave = async (data: {
      scheduleData: DayScheduleInputModel | null,
      scheduleId: number | null,
      workDayData: WorkDayInputModel | null,
      workDayId: number | null,
      shouldDeleteSchedule: boolean,
      shouldDeleteWorkDay: boolean
    }) => {
      // Utilisation de Promise.all pour exécuter toutes les opérations en parallèle
      const promises: Promise<any>[] = [];

      console.log("HandleSave data:", data); // Debug pour voir quelles données sont reçues

      // Traiter le planning nounou
      if (data.shouldDeleteSchedule && data.scheduleId) {
        // Si on doit supprimer le planning
        console.log("Deleting schedule:", data.scheduleId);
        promises.push(deleteSchedule(data.scheduleId));
      } else if (data.scheduleData) {
        // Si on doit créer ou mettre à jour le planning
        if (data.scheduleId) {
          console.log("Updating schedule:", data.scheduleId, data.scheduleData);
          promises.push(updateDaySchedule(data.scheduleId, data.scheduleData));
        } else {
          console.log("Creating schedule:", data.scheduleData);
          promises.push(createDaySchedule(data.scheduleData));
        }
      }

      // Traiter le quart de travail
      if (data.shouldDeleteWorkDay && data.workDayId) {
        // Si on doit supprimer le quart de travail
        console.log("Deleting workDay:", data.workDayId);
        promises.push(deleteWork(data.workDayId));
      } else if (data.workDayData) {
        // Si on doit créer ou mettre à jour le quart de travail
        if (data.workDayId) {
          console.log("Updating workDay:", data.workDayId, data.workDayData);
          promises.push(updateWorkDay(data.workDayId, data.workDayData));
        } else {
          console.log("Creating workDay:", data.workDayData);
          promises.push(createWorkDay(data.workDayData));
        }
      }

      // Attendre que toutes les opérations soient terminées
      await Promise.all(promises);

      // Fermer la modale
      showDayModal.value = false;

      // Recharger les données pour rafraîchir l'affichage
      await fetchMonthlySchedule(displayYear.value, displayMonth.value);
      await fetchMonthlyWorkDays(displayYear.value, displayMonth.value);
    };

    const handleDelete = async (data: {
      scheduleId?: number,
      workDayId?: number,
      deleteSchedule: boolean,
      deleteWorkDay: boolean
    }) => {
      const promises: Promise<any>[] = [];  // Spécifier explicitement le type

      if (data.deleteSchedule && data.scheduleId) {
        promises.push(deleteSchedule(data.scheduleId));
      }

      if (data.deleteWorkDay && data.workDayId) {
        promises.push(deleteWork(data.workDayId));
      }

      await Promise.all(promises);
      showDayModal.value = false;

      // Recharger les données après suppression
      await fetchMonthlySchedule(displayYear.value, displayMonth.value);
      await fetchMonthlyWorkDays(displayYear.value, displayMonth.value);
    };

    // Obtenir la couleur du planning
    const getScheduleColor = (schedule: DayScheduleModel): string => {
      if (schedule.timeSlot) {
        return schedule.timeSlot.color;
      }
      return '#CBD5E1'; // Couleur par défaut (slate-300)
    };

    // Récupérer un WorkDay pour une date donnée
    const getWorkDayForDate = (date: string): WorkDayModel | undefined => {
      return getWorkDay(date);
    };

    // Obtenir la couleur d'un WorkShift
    const getWorkShiftColor = (workDay?: WorkDayModel): string => {
      if (!workDay || !workDay.workShift) return '#CBD5E1';
      return workDay.workShift.color;
    };

    // Obtenir le nom d'un WorkShift
    const getWorkShiftName = (workDay?: WorkDayModel): string => {
      if (!workDay || !workDay.workShift) return 'Pas de quart';
      return workDay.workShift.name;
    };

    // Formater une heure
    const formatTime = (time: string | null): string => {
      return time || '--:--';
    };

    // Ouvrir la vue d'impression
    const openPrintView = () => {
      showPrintView.value = true;
    };

    // Fermer la vue d'impression
    const closePrintView = () => {
      showPrintView.value = false;
    };

    return {
      isLoading,
      formattedMonth,
      daysInMonth,
      displayYear,
      displayMonth,
      weekDays,
      timeSlots,
      workShifts,
      showDayModal,
      selectedDate,
      selectedSchedule,
      selectedWorkDay,
      showPrintView,
      changeMonth,
      goToCurrentMonth,
      openDayModal,
      handleSave,
      handleDelete,
      getScheduleColor,
      getWorkDayForDate,
      getWorkShiftColor,
      getWorkShiftName,
      formatTime,
      openPrintView,
      closePrintView
    };
  }
});
</script>

<style scoped>
.calendar {
  position: relative;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-day {
  min-height: 7rem;
  transition: all 0.2s;
}

.calendar-day:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.day-header {
  width: 100%;
  min-height: 28px;
}

.work-shift-badge {
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 2;
}

.work-shift-badge:hover {
  transform: scale(1.2);
}

.day-schedule {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.print-view-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 1000;
  overflow-y: auto;
}

@media print {
  .calendar-header button {
    display: none;
  }
}
</style>
