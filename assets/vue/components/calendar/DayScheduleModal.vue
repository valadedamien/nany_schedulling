<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ schedule ? 'Modifier le planning' : 'Ajouter un planning' }}
        </h3>
        <button type="button" class="modal-close" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="saveSchedule">
          <!-- Date (affichage seulement) -->
          <div class="form-group">
            <label class="form-label">Date</label>
            <div class="form-display">{{ formattedDate }}</div>
          </div>

          <!-- Choix du type de planning -->
          <div class="form-group">
            <label class="form-label">Type de planning</label>
            <div class="flex space-x-2">
              <button
                  type="button"
                  class="tab-button"
                  :class="{ 'active': planningType === 'preset' }"
                  @click="planningType = 'preset'"
              >
                Créneau prédéfini
              </button>
              <button
                  type="button"
                  class="tab-button"
                  :class="{ 'active': planningType === 'custom' }"
                  @click="planningType = 'custom'"
              >
                Horaire personnalisé
              </button>
            </div>
          </div>

          <!-- Créneau horaire prédéfini -->
          <div v-if="planningType === 'preset'" class="form-group">
            <label for="timeSlotId" class="form-label">Créneau horaire</label>
            <select
                id="timeSlotId"
                v-model="form.timeSlotId"
                class="form-select"
                required
            >
              <option disabled value="">Sélectionnez un créneau</option>
              <option
                  v-for="slot in timeSlots"
                  :key="slot.id"
                  :value="slot.id"
                  :style="{ backgroundColor: slot.color + '33' }"
              >
                {{ slot.name }} ({{ slot.dropOffTime }} - {{ slot.pickUpTime }})
              </option>
            </select>
          </div>

          <!-- Horaires personnalisés -->
          <div v-if="planningType === 'custom'" class="space-y-4">
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
              <div v-if="timeError" class="text-red-500 text-xs mt-1">
                {{ timeError }}
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="form-group">
            <label for="note" class="form-label">Note (optionnelle)</label>
            <textarea
                id="note"
                v-model="form.note"
                class="form-textarea"
                rows="3"
                placeholder="Informations complémentaires..."
            ></textarea>
          </div>

          <!-- Boutons d'action -->
          <div class="modal-actions">
            <button
                v-if="schedule"
                type="button"
                class="btn-danger"
                @click="confirmDelete"
            >
              Supprimer
            </button>

            <div class="flex space-x-2">
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
                  :disabled="isSubmitting || !!timeError"
              >
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
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { DayScheduleModel, DayScheduleInputModel } from '../../models/DayScheduleModel';
import { TimeSlotModel } from '../../models/TimeSlotModel';

export default defineComponent({
  name: 'DayScheduleModal',
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
    }
  },
  emits: ['close', 'save', 'delete'],
  setup(props, { emit }) {
    // Type de planning (prédéfini ou personnalisé)
    const planningType = ref<'preset' | 'custom'>(props.schedule?.timeSlot ? 'preset' : 'custom');

    // Formulaire
    const form = ref<{
      timeSlotId: number | null,
      customDropOffTime: string | null,
      customPickUpTime: string | null,
      note: string | null
    }>({
      timeSlotId: props.schedule?.timeSlot?.id || null,
      customDropOffTime: props.schedule?.customDropOffTime || null,
      customPickUpTime: props.schedule?.customPickUpTime || null,
      note: props.schedule?.note || null
    });

    // État de soumission
    const isSubmitting = ref(false);

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
      if (planningType.value !== 'custom') return null;

      if (form.value.customDropOffTime && form.value.customPickUpTime) {
        const dropOff = new Date(`2000-01-01T${form.value.customDropOffTime}`);
        const pickUp = new Date(`2000-01-01T${form.value.customPickUpTime}`);

        if (dropOff >= pickUp) {
          return "L'heure de récupération doit être après l'heure de dépôt";
        }
      }

      return null;
    });

    // Mettre à jour le formulaire quand le type de planning change
    watch(planningType, (newType) => {
      if (newType === 'preset') {
        form.value.customDropOffTime = null;
        form.value.customPickUpTime = null;
      } else {
        form.value.timeSlotId = null;

        // Si on n'a pas encore d'horaires personnalisés, on initialise avec des valeurs par défaut
        if (!form.value.customDropOffTime) {
          form.value.customDropOffTime = '08:00';
        }

        if (!form.value.customPickUpTime) {
          form.value.customPickUpTime = '17:00';
        }
      }
    });

    // Sauvegarder le planning
    const saveSchedule = async () => {
      if (timeError.value) return;

      isSubmitting.value = true;

      try {
        const data: DayScheduleInputModel = {
          date: props.date,
          timeSlotId: planningType.value === 'preset' ? form.value.timeSlotId : null,
          custom_drop_off_time: planningType.value === 'custom' ? form.value.customDropOffTime : null,
          custom_pick_up_time: planningType.value === 'custom' ? form.value.customPickUpTime : null,
          note: form.value.note
        };

        emit('save', data, props.schedule?.id);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du planning:', error);
        alert('Une erreur est survenue lors de la sauvegarde du planning.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Confirmer la suppression
    const confirmDelete = () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
        if (props.schedule?.id) {
          emit('delete', props.schedule.id);
        }
      }
    };

    return {
      planningType,
      form,
      isSubmitting,
      formattedDate,
      timeError,
      saveSchedule,
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
  max-width: 500px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
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

.form-display {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background-color: white;
  color: #4b5563;
  flex: 1;
}

.tab-button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
}

.btn-danger {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #fee2e2;
}
</style>
