<template>
  <div id="app">
    <Navbar />

    <!-- Page Transition -->
    <router-view v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>

    <!-- Custom Toast System -->
    <Teleport to="body">
      <div class="toast-viewport">
        <TransitionGroup name="toast" tag="div" class="toast-list">
          <div
            v-for="note in notificationStore.notifications"
            :key="note.id"
            class="toast-item"
            :class="note.type"
          >
            <!-- Icon -->
            <div class="toast-icon-wrap">
              <span class="toast-icon" :class="note.type">
                <i v-if="note.type === 'success'" class="bi bi-check-lg"></i>
                <i v-else-if="note.type === 'error'" class="bi bi-exclamation-triangle"></i>
                <i v-else-if="note.type === 'warning'" class="bi bi-exclamation-circle"></i>
                <i v-else class="bi bi-info-circle"></i>
              </span>
            </div>

            <!-- Content -->
            <div class="toast-content">
              <div v-if="note.title" class="toast-title">{{ note.title }}</div>
              <div class="toast-message">{{ note.message }}</div>
            </div>

            <!-- Close Button -->
            <button class="toast-close" @click="notificationStore.removeNotification(note.id)">
              <i class="bi bi-x"></i>
            </button>

            <!-- Progress Bar -->
            <div class="toast-progress-wrap">
              <div class="toast-progress" :class="note.type"></div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import { useNotificationStore } from './stores/notification'

const notificationStore = useNotificationStore()
</script>

<style>
/* ── App Root ───────────────────────────────────────────────── */
#app {
  min-height: 100vh;
  background-color: var(--bg-color, #F9FAFB);
}

/* ── Page Transitions ───────────────────────────────────────── */
.page-enter-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(18px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

/* ── Toast Viewport ─────────────────────────────────────────── */
.toast-viewport {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Toast Item ─────────────────────────────────────────────── */
.toast-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 300px;
  max-width: 380px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
  padding: 14px 40px 18px 14px;
  overflow: hidden;
  pointer-events: all;
  border-left: 4px solid;
}

.toast-item.success { border-color: #10B981; }
.toast-item.error   { border-color: #EF4444; }
.toast-item.warning { border-color: #F59E0B; }
.toast-item.info    { border-color: #3B82F6; }

/* ── Toast Icon ─────────────────────────────────────────────── */
.toast-icon-wrap {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 0.9rem;
}

.toast-icon.success { background: #ECFDF5; color: #059669; }
.toast-icon.error   { background: #FEF2F2; color: #DC2626; }
.toast-icon.warning { background: #FFFBEB; color: #D97706; }
.toast-icon.info    { background: #EFF6FF; color: #2563EB; }

/* ── Toast Content ──────────────────────────────────────────── */
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.88rem;
  color: #111827;
  margin-bottom: 2px;
  font-family: 'Inter', sans-serif;
}

.toast-message {
  font-size: 0.83rem;
  color: #6B7280;
  line-height: 1.45;
  font-family: 'Inter', sans-serif;
}

/* ── Toast Close ────────────────────────────────────────────── */
.toast-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 4px;
  border-radius: 6px;
  line-height: 1;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.toast-close:hover {
  color: #374151;
  background-color: #F3F4F6;
}

/* ── Progress Bar ───────────────────────────────────────────── */
.toast-progress-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0,0,0,0.05);
}

.toast-progress {
  height: 100%;
  width: 100%;
  border-radius: 0 0 14px 14px;
  animation: toastShrink 5s linear forwards;
  transform-origin: left;
}

.toast-progress.success { background: #10B981; }
.toast-progress.error   { background: #EF4444; }
.toast-progress.warning { background: #F59E0B; }
.toast-progress.info    { background: #3B82F6; }

@keyframes toastShrink {
  from { width: 100%; }
  to   { width: 0%; }
}

/* ── Toast Transitions ──────────────────────────────────────── */
.toast-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>