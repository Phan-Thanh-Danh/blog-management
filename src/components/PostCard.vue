<template>
  <div class="card mb-4 shadow-sm post-card">
    <div 
      v-if="displayImages.length > 0" 
      class="grid-layout"
      :class="`cols-${Math.min(displayImages.length, 4)}`"
    >
      <div 
        v-for="(img, index) in displayImages.slice(0, 4)" 
        :key="index" 
        class="grid-item"
      >
        <img :src="img" :alt="post.title">
        <div v-if="index === 3 && displayImages.length > 4" class="more-overlay">
          +{{ displayImages.length - 4 }}
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <h5 class="card-title fw-bold">{{ post.title }}</h5>
      <p class="card-text text-muted">{{ truncateContent(post.content, 150) }}</p>
      
      <div class="d-flex align-items-center mb-3">
        <img 
          :src="post.authorAvatar" 
          class="rounded-circle me-2" 
          width="40" 
          height="40" 
          :alt="post.authorName"
        >
        <div class="flex-grow-1">
          <strong class="d-block">{{ post.authorName }}</strong>
          <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
        </div>
      </div>

      <!-- Thống kê Like & Comments -->
      <div class="post-stats d-flex gap-3 mb-3 pb-3 border-bottom">
        <span class="text-muted small">
          <i class="bi bi-heart-fill text-danger"></i> {{ likesCount }} lượt thích
        </span>
        <span class="text-muted small">
          <i class="bi bi-chat-dots-fill text-primary"></i> {{ commentsCount }} bình luận
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="post-actions d-flex gap-2 mb-3">
        <!-- Like Button -->
        <button 
          @click="handleLike" 
          class="btn btn-outline-danger btn-sm flex-grow-1"
          :class="{ 'active': isLiked }"
        >
          <i class="bi" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
          {{ isLiked ? 'Đã thích' : 'Thích' }}
        </button>

        <!-- View Detail Button -->
        <router-link 
          :to="`/post/${post.id}`" 
          class="btn btn-outline-primary btn-sm flex-grow-1"
        >
          <i class="bi bi-eye"></i> Xem chi tiết
        </router-link>
      </div>

      <!-- Edit & Delete Buttons (chỉ hiển thị cho tác giả) -->
      <div v-if="authStore.user && authStore.user.id === post.authorId" class="d-flex gap-2">
        <button @click="$emit('edit', post)" class="btn btn-warning btn-sm flex-grow-1">
          <i class="bi bi-pencil"></i> Sửa
        </button>
        <button @click="handleDelete" class="btn btn-danger btn-sm flex-grow-1">
          <i class="bi bi-trash"></i> Xóa
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

// Computed: Lấy danh sách ảnh để hiển thị
const displayImages = computed(() => {
  if (props.post.images && props.post.images.length > 0) {
    return props.post.images
  }
  if (props.post.image) {
    return [props.post.image]
  }
  return []
})

// Computed: Đếm số likes
const likesCount = computed(() => {
  return authStore.getPostLikesCount(props.post.id)
})

// Computed: Kiểm tra đã like chưa
const isLiked = computed(() => {
  return authStore.isPostLiked(props.post.id)
})

// Computed: Đếm số comments (bao gồm cả replies)
const commentsCount = computed(() => {
  return authStore.comments.filter(c => c.postId === props.post.id).length
})

const truncateContent = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const handleLike = () => {
  if (!authStore.isAuthenticated) {
    alert('Bạn cần đăng nhập để thích bài viết')
    return
  }

  try {
    authStore.toggleLike(props.post.id)
  } catch (error) {
    alert(error.message)
  }
}

const handleDelete = () => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    emit('delete', props.post.id)
  }
}
</script>

<style scoped>
.post-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

/* Images Grid Styles */
.grid-layout {
  display: grid;
  gap: 2px;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #f0f0f0;
}

.grid-layout.cols-1 { grid-template-columns: 1fr; aspect-ratio: auto; }
.grid-layout.cols-1 .grid-item img { max-height: 500px; object-fit: cover; }

.grid-layout.cols-2 { grid-template-columns: 1fr 1fr; }
.grid-layout.cols-3 { 
  grid-template-columns: 1fr 1fr; 
  grid-template-rows: 1fr 1fr;
}
.grid-layout.cols-3 .grid-item:first-child { grid-row: span 2; } 

.grid-layout.cols-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.grid-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.card-title {
  color: #2c3e50;
  font-size: 1.25rem;
  line-height: 1.4;
}

.card-text {
  line-height: 1.6;
}

.btn-outline-danger.active {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.post-stats {
  font-size: 0.9rem;
}

.post-actions .btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.post-actions .btn:hover {
  transform: scale(1.05);
}
</style>