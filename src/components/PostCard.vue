<template>
  <div class="card mb-4 shadow-sm">
    <img v-if="post.image" :src="post.image" class="card-img-top" :alt="post.title" style="height: 200px; object-fit: cover;">
    
    <div class="card-body">
      <h5 class="card-title">{{ post.title }}</h5>
      <p class="card-text">{{ truncateContent(post.content, 150) }}</p>
      
      <div class="d-flex align-items-center mb-3">
        <img :src="post.authorAvatar" class="rounded-circle me-2" width="32" height="32" :alt="post.authorName">
        <div>
          <small class="text-muted">{{ post.authorName }}</small><br>
          <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
        </div>
      </div>
      
      <router-link :to="`/post/${post.id}`" class="btn btn-primary btn-sm">
        <i class="bi bi-eye"></i> Xem chi tiết
      </router-link>
      
      <template v-if="authStore.user && authStore.user.id === post.authorId">
        <button @click="$emit('edit', post)" class="btn btn-warning btn-sm ms-2">
          <i class="bi bi-pencil"></i> Sửa
        </button>
        <button @click="handleDelete" class="btn btn-danger btn-sm ms-2">
          <i class="bi bi-trash"></i> Xóa
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const truncateContent = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = () => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    emit('delete', props.post.id)
  }
}
</script>