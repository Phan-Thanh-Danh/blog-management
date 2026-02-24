<template>
  <div id="app">
    <Navbar />
    <router-view />

    <!-- Toast Container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1080;">
      <div 
        v-for="note in notificationStore.notifications" 
        :key="note.id"
        class="toast show mb-2 border-0 shadow-sm" 
        role="alert" 
      >
        <div class="toast-header border-0 pb-0" :class="`bg-${note.type}-subtle`">
          <i v-if="note.type === 'success'" class="bi bi-check-circle-fill text-success me-2"></i>
          <i v-else-if="note.type === 'error'" class="bi bi-exclamation-circle-fill text-danger me-2"></i>
          <i v-else class="bi bi-info-circle-fill text-primary me-2"></i>
          <strong class="me-auto">{{ note.title || 'Thông báo' }}</strong>
          <button type="button" class="btn-close shadow-none" @click="notificationStore.removeNotification(note.id)"></button>
        </div>
        <div class="toast-body pt-1 pb-2 small">
          {{ note.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import { useNotificationStore } from './stores/notification'

const notificationStore = useNotificationStore()
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #ffffff;
}

.toast {
  background-color: white;
  min-width: 250px;
  border-radius: 8px !important;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.bg-success-subtle { background-color: #d1e7dd !important; color: #0f5132 !important; }
.bg-error-subtle { background-color: #f8d7da !important; color: #842029 !important; }
.bg-info-subtle { background-color: #cff4fc !important; color: #055160 !important; }
</style>