<template>
  <div class="d-flex mb-3">
    <img :src="comment.authorAvatar" class="rounded-circle me-3" width="40" height="40" :alt="comment.authorName">
    <div class="flex-grow-1">
      <div class="bg-light p-3 rounded">
        <strong>{{ comment.authorName }}</strong>
        <p class="mb-1 mt-2">{{ comment.content }}</p>
        <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  comment: {
    type: Object,
    required: true
  }
})

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
</script>