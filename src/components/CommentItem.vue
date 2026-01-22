<template>
  <div class="comment-wrapper mb-3">
    <!-- Comment chính -->
    <div class="d-flex">
      <img 
        :src="comment.authorAvatar" 
        class="rounded-circle me-3" 
        width="40" 
        height="40" 
        :alt="comment.authorName"
      >
      <div class="flex-grow-1">
        <div class="comment-body bg-light p-3 rounded-3">
          <strong class="d-block mb-1">{{ comment.authorName }}</strong>
          <p class="mb-2">{{ comment.content }}</p>
          <div class="d-flex align-items-center gap-3">
            <small class="text-muted">
              <i class="bi bi-clock"></i> {{ formatDate(comment.createdAt) }}
            </small>
            <button 
              v-if="authStore.isAuthenticated"
              @click="toggleReply" 
              class="btn btn-link btn-sm text-decoration-none p-0"
            >
              <i class="bi bi-reply"></i> Trả lời
            </button>
            <span v-if="repliesCount > 0" class="text-muted small">
              {{ repliesCount }} phản hồi
            </span>
          </div>
        </div>

        <!-- Form trả lời -->
        <div v-if="showReplyForm" class="mt-2">
          <div class="d-flex gap-2">
            <img 
              :src="authStore.user.avatar" 
              class="rounded-circle" 
              width="32" 
              height="32" 
              :alt="authStore.user.name"
            >
            <div class="flex-grow-1">
              <textarea 
                v-model="replyContent"
                class="form-control form-control-sm mb-2"
                rows="2"
                placeholder="Viết phản hồi..."
                @keydown.ctrl.enter="handleReply"
              ></textarea>
              <div class="d-flex gap-2">
                <button @click="handleReply" class="btn btn-primary btn-sm">
                  <i class="bi bi-send"></i> Gửi
                </button>
                <button @click="cancelReply" class="btn btn-secondary btn-sm">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách replies -->
        <div v-if="replies.length > 0" class="replies-list mt-3">
          <CommentItem 
            v-for="reply in replies" 
            :key="reply.id" 
            :comment="reply"
            :is-reply="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  }
})

const showReplyForm = ref(false)
const replyContent = ref('')

// Lấy danh sách replies
const replies = computed(() => {
  if (props.isReply) return [] // Reply không có sub-replies
  return authStore.getCommentReplies(props.comment.id)
})

const repliesCount = computed(() => replies.value.length)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000) // seconds

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

const toggleReply = () => {
  showReplyForm.value = !showReplyForm.value
  if (showReplyForm.value) {
    replyContent.value = ''
  }
}

const cancelReply = () => {
  showReplyForm.value = false
  replyContent.value = ''
}

const handleReply = () => {
  if (!replyContent.value.trim()) {
    alert('Vui lòng nhập nội dung phản hồi')
    return
  }

  try {
    authStore.createComment(
      props.comment.postId, 
      replyContent.value,
      props.comment.id // parentId
    )
    replyContent.value = ''
    showReplyForm.value = false
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.comment-wrapper {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-body {
  transition: all 0.2s ease;
}

.comment-body:hover {
  background-color: #e9ecef !important;
}

.replies-list {
  border-left: 2px solid #dee2e6;
  padding-left: 1rem;
}

.btn-link {
  font-size: 0.875rem;
  color: #6c757d;
}

.btn-link:hover {
  color: #0d6efd;
}
</style>