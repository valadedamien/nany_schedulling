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
            @click="day.isCurrentMonth && openDayScheduleModal(day.date, day.schedule)"
        >
          <!-- Numéro du jour -->
          <div
              class="day-number absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded-full text-sm"
              :class="day.isToday ? 'bg-blue-500 text-white' : 'text-gray-700'"
          >
            {{ day.day }}
          </div>

          <!-- Planning du jour -->
          <div
              v-if="day.schedule"
              class="day-schedule mt-7 mx-1 p-1 rounded text-xs"
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
              v-else-if="day.isCurrentMonth"
              class="day-empty flex items-center justify-center h-full text-gray-400 text-xs italic"
          >
            <span>Cliquez pour ajouter</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale pour ajouter/modifier un planning -->
    <DayScheduleModal
        v-if="showDayScheduleModal"
        :date="selectedDate"
        :schedule="selectedSchedule"
        :time-slots="timeSlots"
        @close="showDayScheduleModal = false"
        @save="saveDaySchedule"
        @delete="deleteDaySchedule"
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
import { DayScheduleModel, DayScheduleInputModel } from '../../models/DayScheduleModel';
import DayScheduleModal from './DayScheduleModal.vue';
import PrintableSchedule from './PrintableSchedule.vue';

export default defineComponent({
  name: 'Calendar',
  components: {
    DayScheduleModal,
    PrintableSchedule
  },
  setup() {
    // Initialisation des composables
    const {
      isLoading,
      formattedMonth,
      daysInMonth,
      displayYear,
      displayMonth,
      fetchMonthlySchedule,
      changeMonth,
      goToCurrentMonth,
      createDaySchedule,
      updateDaySchedule,
      deleteDaySchedule: deleteSchedule
    } = useSchedule();

    const { timeSlots, timeSlotColorMap } = useTimeSlots();

    // État de la modale
    const showDayScheduleModal = ref(false);
    const selectedDate = ref('');
    const selectedSchedule = ref<DayScheduleModel | undefined>(undefined);

    // État de la vue d'impression
    const showPrintView = ref(false);

    // Jours de la semaine
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Charger le planning du mois en cours
    onMounted(async () => {
      const now = new Date();
      await fetchMonthlySchedule(now.getFullYear(), now.getMonth() + 1);
    });

    // Ouvrir la modale pour ajouter/modifier un planning
    const openDayScheduleModal = (date: string, schedule?: DayScheduleModel) => {
      selectedDate.value = date;
      selectedSchedule.value = schedule;
      showDayScheduleModal.value = true;
    };

    // Sauvegarder un planning
    const saveDaySchedule = async (data: DayScheduleInputModel, id?: number) => {
      if (id) {
        await updateDaySchedule(id, data);
      } else {
        await createDaySchedule(data);
      }
      showDayScheduleModal.value = false;
    };

    // Supprimer un planning
    const deleteDaySchedule = async (id: number) => {
      await deleteSchedule(id);
      showDayScheduleModal.value = false;
    };

    // Obtenir la couleur du planning
    const getScheduleColor = (schedule: DayScheduleModel): string => {
      if (schedule.timeSlot) {
        return schedule.timeSlot.color;
      }
      return '#CBD5E1'; // Couleur par défaut (slate-300)
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
      showDayScheduleModal,
      selectedDate,
      selectedSchedule,
      showPrintView,
      changeMonth,
      goToCurrentMonth,
      openDayScheduleModal,
      saveDaySchedule,
      deleteDaySchedule,
      getScheduleColor,
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
