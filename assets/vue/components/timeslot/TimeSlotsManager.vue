<template>
  <div class="time-slots-manager">
    <div class="header">
      <h2 class="title">Gestion des créneaux horaires</h2>
      <button
          type="button"
          class="btn-primary"
          @click="openModal()"
      >
        Ajouter un créneau
      </button>
    </div>

    <!-- Tableau des créneaux horaires -->
    <div class="table-container">
      <table class="time-slots-table">
        <thead>
        <tr>
          <th>Nom</th>
          <th>Dépôt</th>
          <th>Récupération</th>
          <th>Couleur</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="isLoading" class="loading-row">
          <td colspan="5" class="text-center py-4">
            <div class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </div>
          </td>
        </tr>
        <tr v-else-if="timeSlots.length === 0" class="empty-row">
          <td colspan="5" class="text-center py-4 text-gray-500">
            Aucun créneau horaire défini
          </td>
        </tr>
        <tr
            v-for="slot in timeSlots"
            :key="slot.id"
            class="time-slot-row"
        >
          <td>{{ slot.name }}</td>
          <td>{{ slot.dropOffTime }}</td>
          <td>{{ slot.pickUpTime }}</td>
          <td class="color-cell">
            <div
                class="color-preview"
                :style="{ backgroundColor: slot.color }"
            ></div>
            <span>{{ slot.color }}</span>
          </td>
          <td class="actions-cell">
            <button
                type="button"
                class="btn-edit"
                @click="openModal(slot)"
                title="Modifier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
                type="button"
                class="btn-delete"
                @click="confirmDelete(slot)"
                title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modale d'édition -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editingSlot ? 'Modifier le créneau horaire' : 'Ajouter un créneau horaire' }}
          </h3>
          <button type="button" class="modal-close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveTimeSlot">
            <!-- Nom -->
            <div class="form-group">
              <label for="name" class="form-label">Nom du créneau</label>
              <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  required
                  minlength="2"
                  maxlength="255"
                  placeholder="Ex: Matinée, Journée complète, etc."
              />
            </div>

            <!-- Heures -->
            <div class="form-row">
              <div class="form-group">
                <label for="dropOffTime" class="form-label">Heure de dépôt</label>
                <input
                    id="dropOffTime"
                    v-model="form.dropOffTime"
                    type="time"
                    class="form-input"
                    required
                />
              </div>

              <div class="form-group">
                <label for="pickUpTime" class="form-label">Heure de récupération</label>
                <input
                    id="pickUpTime"
                    v-model="form.pickUpTime"
                    type="time"
                    class="form-input"
                    required
                />
              </div>
            </div>

            <div v-if="timeError" class="error-message">
              {{ timeError }}
            </div>

            <!-- Couleur -->
            <div class="form-group">
              <label for="color" class="form-label">Couleur</label>
              <div class="color-picker">
                <input
                    id="color"
                    v-model="form.color"
                    type="color"
                    class="form-color"
                    required
                />
                <input
                    v-model="form.color"
                    type="text"
                    class="form-input color-text"
                    required
                    pattern="#[0-9A-Fa-f]{6}"
                    placeholder="#000000"
                />
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="modal-actions">
              <button
                  type="button"
                  class="btn-secondary"
                  @click="closeModal"
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
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import useTimeSlots from '../../composables/useTimeSlots';
import { TimeSlotModel, TimeSlotInputModel } from '../../models/TimeSlotModel';

export default defineComponent({
  name: 'TimeSlotsManager',
  setup() {
    const {
      timeSlots,
      isLoading,
      error,
      fetchTimeSlots,
      addTimeSlot,
      updateTimeSlot,
      deleteTimeSlot
    } = useTimeSlots();

    // Modale
    const showModal = ref(false);
    const editingSlot = ref<TimeSlotModel | null>(null);
    const isSubmitting = ref(false);

    // Formulaire
    const form = ref<TimeSlotInputModel>({
      name: '',
      dropOffTime: '08:00',
      pickUpTime: '17:00',
      color: '#3B82F6'
    });

    // Vérifier les erreurs d'heure
    const timeError = computed(() => {
      if (form.value.dropOffTime && form.value.pickUpTime) {
        const dropOff = new Date(`2000-01-01T${form.value.dropOffTime}`);
        const pickUp = new Date(`2000-01-01T${form.value.pickUpTime}`);

        if (dropOff >= pickUp) {
          return "L'heure de récupération doit être après l'heure de dépôt";
        }
      }

      return null;
    });

    // Ouvrir la modale d'édition
    const openModal = (slot?: TimeSlotModel) => {
      if (slot) {
        editingSlot.value = slot;
        form.value = {
          name: slot.name,
          dropOffTime: slot.dropOffTime,
          pickUpTime: slot.pickUpTime,
          color: slot.color
        };
      } else {
        editingSlot.value = null;
        form.value = {
          name: '',
          dropOffTime: '08:00',
          pickUpTime: '17:00',
          color: '#3B82F6'
        };
      }

      showModal.value = true;
    };

    // Fermer la modale
    const closeModal = () => {
      showModal.value = false;
    };

    // Enregistrer le créneau horaire
    const saveTimeSlot = async () => {
      if (timeError.value) return;

      isSubmitting.value = true;

      try {
        if (editingSlot.value) {
          await updateTimeSlot(editingSlot.value.id, form.value);
        } else {
          await addTimeSlot(form.value);
        }

        closeModal();
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du créneau horaire:', err);
        alert('Une erreur est survenue lors de la sauvegarde du créneau horaire.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Confirmer la suppression d'un créneau
    const confirmDelete = async (slot: TimeSlotModel) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer le créneau "${slot.name}" ? Cette action ne pourra pas être annulée.`)) {
        try {
          await deleteTimeSlot(slot.id);
        } catch (err) {
          console.error('Erreur lors de la suppression du créneau horaire:', err);
          alert('Une erreur est survenue lors de la suppression du créneau horaire.');
        }
      }
    };

    return {
      timeSlots,
      isLoading,
      error,
      showModal,
      editingSlot,
      form,
      isSubmitting,
      timeError,
      openModal,
      closeModal,
      saveTimeSlot,
      confirmDelete
    };
  }
});
</script>

<style scoped>
.time-slots-manager {
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.table-container {
  overflow-x: auto;
}

.time-slots-table {
  width: 100%;
  border-collapse: collapse;
}

.time-slots-table th {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.time-slots-table td {
  padding: 0.75rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
}

.color-cell {
  display: flex;
  align-items: center;
}

.color-preview {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  border: 1px solid #e5e7eb;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
}

.btn-edit {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-edit:hover {
  background-color: #e5e7eb;
}

.btn-delete {
  background-color: #fee2e2;
  color: #ef4444;
}

.btn-delete:hover {
  background-color: #fecaca;
}

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
  max-width: 450px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-color {
  width: 3rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}

.color-text {
  flex: 1;
}

.error-message {
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  color: #ef4444;
  font-size: 0.75rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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
</style>
