<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="dialogStore.isOpen" class="dialog-backdrop" @click.self="dialogStore.handleCancel">
        <Transition name="dialog-pop">
          <div v-if="dialogStore.isOpen" class="dialog-box" role="dialog" :aria-label="dialogStore.title">
            <!-- Icon -->
            <div class="dialog-icon-wrap">
              <span class="dialog-icon" :class="dialogStore.type">
                <i v-if="dialogStore.type === 'success'" class="bi bi-check-lg"></i>
                <i v-else-if="dialogStore.type === 'error'" class="bi bi-x-lg"></i>
                <i v-else-if="dialogStore.type === 'warning'" class="bi bi-exclamation-lg"></i>
                <i v-else-if="dialogStore.type === 'confirm'" class="bi bi-question-lg"></i>
                <i v-else class="bi bi-info-lg"></i>
              </span>
            </div>

            <!-- Content -->
            <div class="dialog-content">
              <h6 class="dialog-title">{{ dialogStore.title }}</h6>
              <p class="dialog-message">{{ dialogStore.message }}</p>
            </div>

            <!-- Actions -->
            <div class="dialog-actions">
              <button
                v-if="dialogStore.cancelLabel"
                class="dialog-btn cancel"
                @click="dialogStore.handleCancel"
              >
                {{ dialogStore.cancelLabel }}
              </button>
              <button
                class="dialog-btn confirm"
                :class="dialogStore.type"
                @click="dialogStore.handleConfirm"
                ref="confirmBtn"
              >
                {{ dialogStore.confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useDialogStore } from '../stores/dialog'

const dialogStore = useDialogStore()
const confirmBtn = ref(null)

// Auto-focus confirm button khi mở
watch(() => dialogStore.isOpen, async (val) => {
  if (val) {
    await nextTick()
    confirmBtn.value?.focus()
  }
})
</script>

<style scoped>
/* ── Backdrop ────────────────────────────────────────────────── */
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Box ─────────────────────────────────────────────────────── */
.dialog-box {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08);
  padding: 2rem 1.75rem 1.5rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

/* ── Icon ────────────────────────────────────────────────────── */
.dialog-icon-wrap {
  margin-bottom: 0.25rem;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.4rem;
  font-weight: 700;
}

.dialog-icon.success { background: #ECFDF5; color: #059669; }
.dialog-icon.error   { background: #FEF2F2; color: #DC2626; }
.dialog-icon.warning { background: #FFFBEB; color: #D97706; }
.dialog-icon.confirm { background: #EFF6FF; color: #2563EB; }
.dialog-icon.info    { background: #F0F9FF; color: #0284C7; }

/* ── Content ─────────────────────────────────────────────────── */
.dialog-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  font-family: 'Inter', sans-serif;
}

.dialog-message {
  margin: 0;
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.5;
  font-family: 'Inter', sans-serif;
}

/* ── Actions ─────────────────────────────────────────────────── */
.dialog-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 0.5rem;
}

.dialog-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  outline: none;
}

.dialog-btn.cancel {
  background: #F3F4F6;
  color: #374151;
}
.dialog-btn.cancel:hover {
  background: #E5E7EB;
}

.dialog-btn.confirm {
  background: #3B82F6;
  color: #fff;
}
.dialog-btn.confirm.success { background: #10B981; }
.dialog-btn.confirm.error   { background: #EF4444; }
.dialog-btn.confirm.warning { background: #F59E0B; }
.dialog-btn.confirm.confirm { background: #3B82F6; }
.dialog-btn.confirm.info    { background: #0284C7; }

.dialog-btn.confirm:hover   { filter: brightness(0.92); transform: translateY(-1px); }
.dialog-btn.confirm:focus   { box-shadow: 0 0 0 3px rgba(59,130,246,0.3); }

/* ── Transitions ─────────────────────────────────────────────── */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.22s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-pop-enter-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialog-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.dialog-pop-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(12px);
}
.dialog-pop-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(6px);
}
</style>
