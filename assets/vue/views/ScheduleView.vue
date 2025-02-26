<template>
  <div class="schedule-view">
    <div class="tabs">
      <button
          class="tab-button"
          :class="{ 'active': activeTab === 'calendar' }"
          @click="activeTab = 'calendar'"
      >
        Calendrier
      </button>
      <button
          class="tab-button"
          :class="{ 'active': activeTab === 'timeSlots' }"
          @click="activeTab = 'timeSlots'"
      >
        Créneaux horaires
      </button>
      <button
          class="tab-button"
          :class="{ 'active': activeTab === 'workShifts' }"
          @click="activeTab = 'workShifts'"
      >
        Quarts de travail
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'calendar'" class="tab-pane">
        <Calendar />
      </div>
      <div v-else-if="activeTab === 'timeSlots'" class="tab-pane">
        <TimeSlotsManager />
      </div>
      <div v-else-if="activeTab === 'workShifts'" class="tab-pane">
        <WorkShiftsManager />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Calendar from '../components/calendar/Calendar.vue';
import TimeSlotsManager from '../components/timeslot/TimeSlotsManager.vue';
import WorkShiftsManager from '../components/workshift/WorkShiftsManager.vue';

export default defineComponent({
  name: 'ScheduleView',
  components: {
    Calendar,
    TimeSlotsManager,
    WorkShiftsManager
  },
  setup() {
    const activeTab = ref('calendar');

    return {
      activeTab
    };
  }
});
</script>

<style scoped>
.schedule-view {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #3b82f6;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.tab-pane {
  padding: 1rem;
}

@media (max-width: 640px) {
  .schedule-view {
    margin: 1rem auto;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
