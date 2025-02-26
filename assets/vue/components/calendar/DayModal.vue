<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ formattedDate }}
        </h3>
        <button type="button" class="modal-close" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="saveAll">
          <div class="form-content">
            <!-- Section Quart de travail avec icône -->
            <div class="section-container">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                <h4 class="section-title">Quart de travail</h4>
              </div>

              <div class="section-content">
                <div class="form-group">
                  <label for="workShiftId" class="form-label">Sélectionnez un quart de travail</label>
                  <div class="work-shift-options">
                    <div
                        class="work-shift-option"
                        :class="{ 'selected': form.workShiftId === null }"
                        @click="form.workShiftId = null"
                    >
                      <div class="work-shift-color" style="background-color: #CBD5E1;"></div>
                      <span>Aucun</span>
                    </div>
                    <div
                        v-for="shift in workShifts"
                        :key="shift.id"
                        class="work-shift-option"
                        :class="{ 'selected': form.workShiftId === shift.id }"
                        @click="form.workShiftId = shift.id"
                    >
                      <div class="work-shift-color" :style="{ backgroundColor: shift.color }"></div>
                      <span>{{ shift.name }}</span>
                    </div>
                  </div>
                </div>

                <div class="form-group" v-if="form.workShiftId">
                  <label for="workShiftNote" class="form-label">Note (optionnelle)</label>
                  <textarea
                      id="workShiftNote"
                      v-model="form.workShiftNote"
                      class="form-textarea"
                      rows="2"
                      placeholder="Informations complémentaires..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Section Planning nounou avec icône -->
            <div class="section-container">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <h4 class="section-title">Horaires nounou</h4>
              </div>

              <div class="section-content">
                <div class="form-group">
                  <label class="form-label">Type de planning</label>
                  <div class="planning-type-selector">
                    <button
                        type="button"
                        class="planning-type-btn"
                        :class="{ 'active': form.hasDaycare && planningType === 'preset' }"
                        @click="activateDaycare('preset')"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                      </svg>
                      Prédéfini
                    </button>
                    <button
                        type="button"
                        class="planning-type-btn"
                        :class="{ 'active': form.hasDaycare && planningType === 'custom' }"
                        @click="activateDaycare('custom')"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                      </svg>
                      Personnalisé
                    </button>
                    <button
                        type="button"
                        class="planning-type-btn"
                        :class="{ 'active': !form.hasDaycare }"
                        @click="deactivateDaycare"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      Aucun
                    </button>
                  </div>
                </div>

                <div v-if="form.hasDaycare" class="daycare-content">
                  <!-- Créneau horaire prédéfini -->
                  <div v-if="planningType === 'preset'" class="form-group">
                    <label for="timeSlotId" class="form-label">Créneau horaire</label>
                    <div class="time-slots-options">
                      <div
                          v-for="slot in timeSlots"
                          :key="slot.id"
                          class="time-slot-option"
                          :class="{ 'selected': form.timeSlotId === slot.id }"
                          @click="form.timeSlotId = slot.id"
                      >
                        <div class="time-slot-color" :style="{ backgroundColor: slot.color }"></div>
                        <div class="time-slot-info">
                          <div class="time-slot-name">{{ slot.name }}</div>
                          <div class="time-slot-times">{{ slot.dropOffTime }} - {{ slot.pickUpTime }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Horaires personnalisés -->
                  <div v-if="planningType === 'custom'" class="custom-time-container">
                    <div class="form-group">
                      <label for="customDropOffTime" class="form-label">Heure de dépôt</label>
                      <input
                          id="customDropOffTime"
                          v-model="form.customDropOffTime"
                          type="time"
                          class="form-input"
                          required
                      />
                    </div>

                    <div class="form-group">
                      <label for="customPickUpTime" class="form-label">Heure de récupération</label>
                      <input
                          id="customPickUpTime"
                          v-model="form.customPickUpTime"
                          type="time"
                          class="form-input"
                          required
                      />
                      <div v-if="timeError" class="error-message">
                        {{ timeError }}
                      </div>
                    </div>
                  </div>

                  <!-- Note planning -->
                  <div class="form-group">
                    <label for="daycareNote" class="form-label">Note (optionnelle)</label>
                    <textarea
                        id="daycareNote"
                        v-model="form.daycareNote"
                        class="form-textarea"
                        rows="2"
                        placeholder="Informations complémentaires..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="modal-actions">
            <button
                v-if="schedule || workDay"
                type="button"
                class="btn-danger"
                @click="confirmDelete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Supprimer
            </button>

            <div class="action-buttons">
              <button
                  type="button"
                  class="btn-secondary"
                  @click="$emit('close')"
              >
                Annuler
              </button>

              <button
                  type="submit"
                  class="btn-primary"
                  :disabled="isSubmitting || (form.hasDaycare && planningType === 'custom' && !!timeError)"
              >
                <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';
import { DayScheduleModel, DayScheduleInputModel } from '../../models/DayScheduleModel';
import { TimeSlotModel } from '../../models/TimeSlotModel';
import { WorkDayModel, WorkDayInputModel } from '../../models/WorkDayModel';
import { WorkShiftModel } from '../../models/WorkShiftModel';

export default defineComponent({
  name: 'DayModal',
  props: {
    date: {
      type: String,
      required: true
    },
    schedule: {
      type: Object as PropType<DayScheduleModel>,
      default: null
    },
    timeSlots: {
      type: Array as PropType<TimeSlotModel[]>,
      required: true
    },
    workDay: {
      type: Object as PropType<WorkDayModel>,
      default: null
    },
    workShifts: {
      type: Array as PropType<WorkShiftModel[]>,
      required: true
    }
  },
  emits: ['close', 'save', 'delete'],
  setup(props, { emit }) {
    // Type de planning (prédéfini ou personnalisé)
    const planningType = ref<'preset' | 'custom'>(props.schedule?.timeSlot ? 'preset' : 'custom');

    // Formulaire unifié
    const form = ref({
      // Quart de travail
      workShiftId: props.workDay?.workShift?.id || null as number | null,
      workShiftNote: props.workDay?.note || null as string | null,

      // Planning nounou
      hasDaycare: !!props.schedule as boolean,
      timeSlotId: props.schedule?.timeSlot?.id || null as number | null,
      customDropOffTime: props.schedule?.customDropOffTime || '08:00' as string | null,
      customPickUpTime: props.schedule?.customPickUpTime || '17:00' as string | null,
      daycareNote: props.schedule?.note || null as string | null
    });

    // États pour la modale
    const isSubmitting = ref(false);
    const deleteOptions = ref<{ schedule: boolean, workDay: boolean }>({
      schedule: false,
      workDay: false
    });

    // Formatter la date pour l'affichage
    const formattedDate = computed(() => {
      if (!props.date) return '';

      const date = new Date(props.date);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    });

    // Vérifier les erreurs d'heure
    const timeError = computed(() => {
      if (!form.value.hasDaycare || planningType.value !== 'custom') return null;

      if (form.value.customDropOffTime && form.value.customPickUpTime) {
        const dropOff = new Date(`2000-01-01T${form.value.customDropOffTime}`);
        const pickUp = new Date(`2000-01-01T${form.value.customPickUpTime}`);

        if (dropOff >= pickUp) {
          return "L'heure de récupération doit être après l'heure de dépôt";
        }
      }

      return null;
    });

    // Activer le planning nounou avec le type spécifié
    const activateDaycare = (type: 'preset' | 'custom') => {
      form.value.hasDaycare = true;
      planningType.value = type;

      // Initialiser les valeurs par défaut si nécessaire
      if (type === 'preset' && !form.value.timeSlotId && props.timeSlots.length > 0) {
        form.value.timeSlotId = props.timeSlots[0].id;
      }

      if (type === 'custom') {
        if (!form.value.customDropOffTime) form.value.customDropOffTime = '08:00';
        if (!form.value.customPickUpTime) form.value.customPickUpTime = '17:00';
      }
    };

    // Désactiver le planning nounou
    const deactivateDaycare = () => {
      form.value.hasDaycare = false;
    };

    // Sauvegarder toutes les données
    const saveAll = async () => {
      isSubmitting.value = true;

      try {
        // Préparation des données pour les deux services
        const updates = {
          schedule: null as DayScheduleInputModel | null,
          workDay: null as WorkDayInputModel | null
        };

        // Préparer les données du planning nounou
        if (form.value.hasDaycare) {
          updates.schedule = {
            date: props.date,
            timeSlotId: planningType.value === 'preset' ? form.value.timeSlotId : null,
            custom_drop_off_time: planningType.value === 'custom' ? form.value.customDropOffTime : null,
            custom_pick_up_time: planningType.value === 'custom' ? form.value.customPickUpTime : null,
            note: form.value.daycareNote
          };
        }

        // Préparer les données du quart de travail
        if (form.value.workShiftId) {
          updates.workDay = {
            date: props.date,
            workShiftId: form.value.workShiftId,
            note: form.value.workShiftNote
          };
        }

        // Émettre l'événement de sauvegarde avec toutes les données
        // Assurons-nous de passer les IDs existants si disponibles
        emit('save', {
          scheduleData: updates.schedule,
          scheduleId: props.schedule?.id || null,
          workDayData: updates.workDay,
          workDayId: props.workDay?.id || null,
          shouldDeleteSchedule: props.schedule && !updates.schedule,
          shouldDeleteWorkDay: props.workDay && !updates.workDay
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Une erreur est survenue lors de la sauvegarde.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Ouvrir la modale de confirmation de suppression
    const confirmDelete = () => {
      // Déterminer ce qui peut être supprimé
      const hasSchedule = !!props.schedule;
      const hasWorkDay = !!props.workDay;


      if (hasSchedule && hasWorkDay) {
        // Si les deux existent, demander ce qu'il faut supprimer
        if (confirm('Que souhaitez-vous supprimer ?\n\n- Cliquez sur OK pour tout supprimer\n- Annulez pour choisir')) {
          emit('delete', {
            scheduleId: props.schedule?.id,
            workDayId: props.workDay?.id,
            deleteSchedule: true,
            deleteWorkDay: true
          });
        } else {
          deleteOptions.value = {
            schedule: true,
            workDay: true
          };
        }
      } else if (hasSchedule) {
        // Seulement planning nounou
        if (confirm('Êtes-vous sûr de vouloir supprimer ce planning de garde ?')) {
          emit('delete', {
            scheduleId: props.schedule?.id,
            deleteSchedule: true,
            deleteWorkDay: false
          });
        }
      } else if (hasWorkDay) {
        // Seulement quart de travail
        if (confirm('Êtes-vous sûr de vouloir supprimer ce quart de travail ?')) {
          emit('delete', {
            workDayId: props.workDay?.id,
            deleteSchedule: false,
            deleteWorkDay: true
          });
        }
      }
    };

    return {
      planningType,
      form,
      isSubmitting,
      formattedDate,
      timeError,
      deleteOptions,
      activateDaycare,
      deactivateDaycare,
      saveAll,
      confirmDelete
    };
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-container {
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 60px);
}

.form-content {
  padding: 1rem 1.5rem;
}

.section-container {
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.section-header svg {
  color: #4b5563;
  margin-right: 0.5rem;
}

.section-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  margin: 0;
}

.section-content {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

/* WorkShift Options Styling */
.work-shift-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.work-shift-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.work-shift-option:hover {
  background-color: #f9fafb;
}

.work-shift-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.work-shift-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

/* TimeSlot Options Styling */
.time-slots-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-slot-option {
  display: flex;
  align-items: center;
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.time-slot-option:hover {
  background-color: #f9fafb;
}

.time-slot-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.time-slot-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.time-slot-info {
  flex: 1;
}

.time-slot-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.time-slot-times {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

/* Planning Type Buttons Styling */
.planning-type-selector {
  display: flex;
  gap: 0.5rem;
}

.planning-type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.planning-type-btn:hover {
  background-color: #f9fafb;
}

.planning-type-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.planning-type-btn.active svg {
  color: white;
}

.custom-time-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.daycare-content {
  animation: fadeIn 0.3s ease-in-out;
}

.error-message {
  margin-top: 0.375rem;
  color: #ef4444;
  font-size: 0.75rem;
}

/* Modal Actions Styling */
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  display: flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-danger {
  display: flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #fee2e2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .work-shift-options {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .custom-time-container {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
  }

  .btn-primary, .btn-secondary, .btn-danger {
    flex: 1;
    justify-content: center;
  }
}
</style>
