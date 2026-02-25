<template>
  <!-- Like button with reaction picker on hover -->
  <div class="reaction-wrapper" @mouseenter="showPicker" @mouseleave="scheduledHide">
    <!-- Main button -->
    <button
      class="btn flex-grow-1 action-btn py-2 reaction-btn"
      :class="reactionClass"
      @click="handleClick"
      @touchstart.prevent="handleTouch"
    >
      <span class="reaction-emoji">{{ currentEmoji }}</span>
    </button>

    <!-- Reaction picker popup -->
    <Transition name="picker-pop">
      <div
        v-if="pickerVisible"
        class="reaction-picker"
        @mouseenter="cancelHide"
        @mouseleave="scheduledHide"
      >
        <button
          v-for="r in REACTIONS"
          :key="r.type"
          class="reaction-item"
          :class="{ active: currentReaction === r.type }"
          @click.stop="selectReaction(r.type)"
          :title="r.label"
        >
          <span class="reaction-item-emoji">{{ r.emoji }}</span>
          <span class="reaction-item-label">{{ r.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  postId: { type: Number, required: true },
  currentReaction: { type: String, default: null } // null | 'like'|'love'|'haha'|'wow'|'sad'|'angry'
})

const emit = defineEmits(['react'])

const REACTIONS = [
  { type: 'like',  emoji: '👍', label: 'Thích',    color: '#1d4ed8' },
  { type: 'love',  emoji: '❤️',  label: 'Yêu thích', color: '#ef4444' },
  { type: 'haha',  emoji: '😂', label: 'Haha',     color: '#f59e0b' },
  { type: 'wow',   emoji: '😮', label: 'Wow',      color: '#f59e0b' },
  { type: 'sad',   emoji: '😢', label: 'Buồn',     color: '#3b82f6' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ', color: '#ef4444' }
]

const currentInfo = computed(() => {
  if (!props.currentReaction) return null
  return REACTIONS.find(r => r.type === props.currentReaction)
})

const currentEmoji = computed(() => currentInfo.value?.emoji || '👍')
const currentLabel = computed(() => currentInfo.value?.label || 'Thích')
const reactionClass = computed(() => {
  if (!props.currentReaction) return ''
  const colorMap = {
    like: 'text-primary',
    love: 'text-danger',
    haha: 'text-warning',
    wow: 'text-warning',
    sad: 'text-info',
    angry: 'text-danger'
  }
  return colorMap[props.currentReaction] || ''
})

// Picker visibility with delay
const pickerVisible = ref(false)
let hideTimer = null
let showTimer = null

const showPicker = () => {
  clearTimeout(hideTimer)
  showTimer = setTimeout(() => { pickerVisible.value = true }, 400)
}

const scheduledHide = () => {
  clearTimeout(showTimer)
  hideTimer = setTimeout(() => { pickerVisible.value = false }, 300)
}

const cancelHide = () => {
  clearTimeout(hideTimer)
}

// Click: toggle like (no picker interaction)
const handleClick = () => {
  if (pickerVisible.value) return
  emit('react', props.currentReaction ? null : 'like')
}

// Touch: show picker
let touchTimer = null
const handleTouch = () => {
  touchTimer = setTimeout(() => { pickerVisible.value = true }, 400)
  window.addEventListener('touchend', closePicker, { once: true })
}
const closePicker = () => {
  clearTimeout(touchTimer)
  setTimeout(() => { pickerVisible.value = false }, 1000)
}

const selectReaction = (type) => {
  pickerVisible.value = false
  // Nếu click lại cùng loại → xóa reaction
  emit('react', props.currentReaction === type ? null : type)
}
</script>

<style scoped>
.reaction-wrapper {
  position: relative;
  flex: 1;
  display: flex;
}

.reaction-btn {
  width: 100%;
  transition: color 0.18s, background 0.18s;
}

.reaction-emoji {
  font-size: 1rem;
  line-height: 1;
  vertical-align: middle;
}

/* Picker popup */
.reaction-picker {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 40px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12);
  padding: 8px 12px;
  display: flex;
  gap: 4px;
  z-index: 1000;
  white-space: nowrap;
  border: 1px solid #e5e7eb;
}

/* Arrow */
.reaction-picker::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #fff;
}

.reaction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  padding: 6px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s;
  gap: 2px;
}

.reaction-item:hover {
  background: #f3f4f6;
  transform: scale(1.25) translateY(-4px);
}

.reaction-item.active {
  background: #eff6ff;
}

.reaction-item-emoji {
  font-size: 1.75rem;
  line-height: 1;
  display: block;
}

.reaction-item-label {
  font-size: 10px;
  color: #374151;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  line-height: 1;
}

/* Transition */
.picker-pop-enter-active {
  transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.picker-pop-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.picker-pop-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.8) translateY(6px);
}
.picker-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.9) translateY(4px);
}
</style>
