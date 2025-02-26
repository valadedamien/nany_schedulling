<template>
  <div class="app">
    <header class="header">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-blue-600">Planning Nounou</h1>
      </div>
    </header>

    <main class="main">
      <ScheduleView />
    </main>

    <footer class="footer">
      <div class="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
        &copy; {{ new Date().getFullYear() }} Planning Nounou - Tous droits réservés
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScheduleView from './views/ScheduleView.vue';

export default defineComponent({
  name: 'App',
  components: {
    ScheduleView
  }
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f1f5f9;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.main {
  min-height: calc(100vh - 130px);
}

.footer {
  background-color: white;
  border-top: 1px solid #e5e7eb;
}
</style>
