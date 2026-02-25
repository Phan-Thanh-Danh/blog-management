<template>
  <Teleport to="body">
    <Transition name="lb-fade">
      <div v-if="isOpen" class="lightbox-backdrop" @click.self="close" @keydown.esc="close" tabindex="0" ref="backdropRef">
        <!-- Close button -->
        <button class="lb-close" @click="close" aria-label="Đóng">
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- Prev -->
        <button v-if="images.length > 1" class="lb-nav lb-prev" @click.stop="prev" aria-label="Ảnh trước">
          <i class="bi bi-chevron-left"></i>
        </button>

        <!-- Main Image -->
        <Transition :name="transitionName" mode="out-in">
          <div class="lb-image-wrap" :key="currentIndex">
            <img :src="images[currentIndex]" class="lb-image" alt="Xem ảnh" @click.stop />
          </div>
        </Transition>

        <!-- Next -->
        <button v-if="images.length > 1" class="lb-nav lb-next" @click.stop="next" aria-label="Ảnh sau">
          <i class="bi bi-chevron-right"></i>
        </button>

        <!-- Dots indicator -->
        <div v-if="images.length > 1" class="lb-dots">
          <span
            v-for="(_, i) in images"
            :key="i"
            class="lb-dot"
            :class="{ active: i === currentIndex }"
            @click.stop="currentIndex = i"
          ></span>
        </div>

        <!-- Counter -->
        <div v-if="images.length > 1" class="lb-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const images = ref([])
const currentIndex = ref(0)
const transitionName = ref('lb-slide-right')
const backdropRef = ref(null)

const open = (imgs, startIndex = 0) => {
  images.value = Array.isArray(imgs) ? imgs : [imgs]
  currentIndex.value = startIndex
  isOpen.value = true
  nextTick(() => backdropRef.value?.focus())
}

const close = () => {
  isOpen.value = false
}

const prev = () => {
  transitionName.value = 'lb-slide-left'
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

const next = () => {
  transitionName.value = 'lb-slide-right'
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

const handleKey = (e) => {
  if (!isOpen.value) return
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))

defineExpose({ open, close })
</script>

<style scoped>
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.lb-image-wrap {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lb-image {
  max-width: 90vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  user-select: none;
}

.lb-close {
  position: fixed;
  top: 16px;
  right: 20px;
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-close:hover { background: rgba(255,255,255,0.25); }

.lb-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.lb-nav:hover { background: rgba(255,255,255,0.28); }
.lb-prev { left: 16px; }
.lb-next { right: 16px; }

.lb-dots {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}
.lb-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s;
}
.lb-dot.active { background: #fff; transform: scale(1.3); }

.lb-counter {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.7);
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
}

/* Transitions */
.lb-fade-enter-active, .lb-fade-leave-active { transition: opacity 0.22s ease; }
.lb-fade-enter-from, .lb-fade-leave-to { opacity: 0; }

.lb-slide-right-enter-active,
.lb-slide-right-leave-active,
.lb-slide-left-enter-active,
.lb-slide-left-leave-active {
  transition: all 0.22s ease;
}
.lb-slide-right-enter-from { opacity: 0; transform: translateX(40px); }
.lb-slide-right-leave-to  { opacity: 0; transform: translateX(-40px); }
.lb-slide-left-enter-from  { opacity: 0; transform: translateX(-40px); }
.lb-slide-left-leave-to   { opacity: 0; transform: translateX(40px); }
</style>
