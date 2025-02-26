<template>
  <div class="printable-schedule">
    <div class="print-controls">
      <button type="button" class="btn-back" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Retour au calendrier
      </button>
      <div class="flex space-x-2">
        <button type="button" class="btn-export" @click="exportAsImage">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
          Exporter en image
        </button>
        <button type="button" class="btn-print" @click="printSchedule">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
          </svg>
          Imprimer
        </button>
      </div>
    </div>

    <div class="print-content">
      <h1 class="print-title">Planning : {{ formattedMonth }}</h1>

      <div class="calendar" ref="calendarRef">
        <!-- Jours de la semaine -->
        <div class="calendar-weekdays grid grid-cols-7">
          <div
              v-for="day in weekDays"
              :key="day"
              class="text-center font-medium py-1 text-gray-500"
          >
            {{ day }}
          </div>
        </div>

        <!-- Jours du mois -->
        <div class="calendar-days grid grid-cols-7 gap-px">
          <div
              v-for="day in generateCalendarDays"
              :key="day.date"
              class="calendar-day relative border rounded-sm overflow-hidden"
              :class="[
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
              'border-gray-200'
            ]"
          >
            <!-- Numéro du jour -->
            <div
                class="day-number absolute top-1 left-1 flex items-center justify-center text-xs"
                :class="[
                'text-gray-700',
                !day.isCurrentMonth ? 'text-gray-400' : ''
              ]"
            >
              {{ day.day }}
            </div>

            <!-- Planning du jour -->
            <div
                v-if="day.schedule"
                class="day-schedule mt-5 mx-1 p-1 rounded text-xs"
                :style="{ backgroundColor: getScheduleColor(day.schedule) }"
            >
              <div class="font-semibold text-center text-xs">
                {{ day.schedule.timeSlot?.name || 'Horaire personnalisé' }}
              </div>
              <div class="flex justify-between mt-1 text-xs">
                <span>D: {{ formatTime(day.schedule.effectiveDropOffTime) }}</span>
                <span>R: {{ formatTime(day.schedule.effectivePickUpTime) }}</span>
              </div>
              <div v-if="day.schedule.note" class="mt-1 text-xs italic truncate">
                {{ day.schedule.note }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue';
import { DayScheduleModel } from '../../models/DayScheduleModel';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  schedule: DayScheduleModel | undefined;
}

export default defineComponent({
  name: 'PrintableSchedule',
  props: {
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    days: {
      type: Array as PropType<{
        date: string,
        day: number,
        isCurrentMonth: boolean,
        isToday: boolean,
        schedule: DayScheduleModel | undefined
      }[]>,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    // Jours de la semaine
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Référence à l'élément du calendrier pour l'export en image
    const calendarRef = ref<HTMLElement | null>(null);

    // Formatter le mois pour l'affichage (ex: Février 2024)
    const formattedMonth = computed(() => {
      const date = new Date(props.year, props.month - 1, 1);
      return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    });

    // Générer tous les jours du calendrier
    const generateCalendarDays = computed<CalendarDay[]>(() => {
      const year = props.year;
      const month = props.month;

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
          schedule: findScheduleForDate(date)
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
          schedule: findScheduleForDate(date)
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
          schedule: findScheduleForDate(date)
        });
      }

      return days;
    });

    // Trouver un planning pour une date donnée
    const findScheduleForDate = (date: string): DayScheduleModel | undefined => {
      return props.days.find(day => day.date === date)?.schedule;
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

    // Fonction d'impression
    const printSchedule = () => {
      window.print();
    };

    // Fonction d'export en image
    const exportAsImage = async () => {
      if (!calendarRef.value) return;

      try {
        // Dynamiquement importer html2canvas
        const html2canvas = (await import('html2canvas')).default;

        // Créer un canvas à partir du calendrier
        const canvas = await html2canvas(calendarRef.value);

        // Convertir le canvas en URL de données
        const imgData = canvas.toDataURL('image/png');

        // Créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Planning-${props.year}-${props.month}.png`;

        // Déclencher le téléchargement
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erreur lors de l\'export en image:', error);
        alert('Une erreur est survenue lors de l\'export en image. Veuillez réessayer.');
      }
    };

    return {
      weekDays,
      calendarRef,
      formattedMonth,
      generateCalendarDays,
      getScheduleColor,
      formatTime,
      printSchedule,
      exportAsImage
    };
  }
});
</script>

<style scoped>
.printable-schedule {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.print-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.btn-back,
.btn-print,
.btn-export {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-back {
  color: #4b5563;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
}

.btn-back:hover {
  background-color: #e5e7eb;
}

.btn-print {
  color: white;
  background-color: #3b82f6;
  border: none;
}

.btn-print:hover {
  background-color: #2563eb;
}

.btn-export {
  color: white;
  background-color: #10b981;
  border: none;
}

.btn-export:hover {
  background-color: #059669;
}

.print-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.calendar {
  position: relative;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-day {
  height: 80px;
}

.day-schedule {
  background-color: rgba(59, 130, 246, 0.1);
}

@media print {
  .printable-schedule {
    max-width: none;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .print-controls {
    display: none;
  }

  .print-title {
    margin-top: 0.2cm;
    margin-bottom: 0.2cm;
    font-size: 14pt;
  }

  .calendar {
    box-shadow: none;
    background-color: transparent;
    padding: 0;
  }

  .calendar-weekdays {
    font-size: 10pt;
  }

  .calendar-day {
    height: auto;
    min-height: 70px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .day-number {
    font-size: 8pt;
  }

  .day-schedule {
    font-size: 8pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .day-schedule div {
    font-size: 8pt;
  }

  @page {
    size: landscape;
    margin: 0.5cm;
  }
}
</style>
