<template>
  <div class="comment-wrapper mb-2">
    <!-- Comment chính -->
    <div class="d-flex gap-2">
      <router-link :to="`/profile/${comment.authorId}`">
        <img 
          :src="comment.authorAvatar" 
          class="rounded-circle mt-1" 
          width="32" 
          height="32" 
          style="object-fit: cover;"
          :alt="comment.authorName"
        >
      </router-link>
      <div class="flex-grow-1">
        <div class="d-inline-block">
            <div class="comment-bubble bg-fb-gray px-3 py-2 rounded-4 position-relative">
              <router-link :to="`/profile/${comment.authorId}`" class="text-decoration-none text-dark">
                <strong class="d-block small fw-bold hover-underline">{{ comment.authorName }}</strong>
              </router-link>
              <p class="mb-0 small" style="line-height: 1.3;">{{ comment.content }}</p>
            </div>
            
            <div class="d-flex gap-3 px-2">
                <button 
                  @click="toggleLike" 
                  class="btn btn-link p-0 fw-bold x-small text-decoration-none"
                  :class="isLikedByMe ? 'text-black' : 'text-dark opacity-75'"
                >
                  Thích
                </button>
                <button @click="toggleReply" class="btn btn-link p-0 fw-bold x-small text-dark opacity-75 text-decoration-none">Phản hồi</button>
                <span class="x-small text-dark opacity-50">{{ formatDate(comment.createdAt) }}</span>
              </div>
        </div>

        <!-- Form trả lời -->
        <div v-if="showReplyForm" class="mt-3 ps-2">
          <div class="d-flex gap-2">
            <img 
              :src="authStore.user.avatar" 
              class="rounded-circle" 
              width="28" 
              height="28" 
              style="object-fit: cover;"
              :alt="authStore.user.name"
            >
            <div class="flex-grow-1">
              <textarea 
                v-model="replyContent"
                class="form-control bg-light border-0 rounded-4 px-3 py-2"
                rows="1"
                placeholder="Viết phản hồi..."
                style="resize: none;"
                @keydown.enter.prevent="handleReply"
              ></textarea>
              <div class="d-flex justify-content-between align-items-center mt-1 px-2">
                <small class="text-dark opacity-50" style="font-size: 11px;">Nhấn Enter để phản hồi</small>
                <button @click="cancelReply" class="btn btn-link p-0 text-dark opacity-50 x-small-text text-decoration-none hover-underline">Hủy</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách replies -->
        <div v-if="replies.length > 0" class="replies-list mt-2 ps-2">
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
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày`
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  })
}

const isLikedByMe = computed(() => authStore.isCommentLiked(props.comment.id))

const toggleReply = () => {
  showReplyForm.value = !showReplyForm.value
  if (showReplyForm.value) {
    replyContent.value = ''
  }
}

const toggleLike = () => {
  try {
    authStore.toggleCommentLike(props.comment.id)
  } catch (error) {
    alert(error.message)
  }
}

const cancelReply = () => {
  showReplyForm.value = false
  replyContent.value = ''
}

const handleReply = () => {
  if (!replyContent.value.trim()) {
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
.bg-fb-gray { background-color: #f0f2f5; }

.comment-wrapper {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

.comment-bubble {
  max-width: 100%;
}

.hover-underline:hover {
  text-decoration: underline !important;
}

.btn-xs {
  font-size: 12px;
}

.x-small-text {
  font-size: 11px;
}

.replies-list {
  border-left: 2px solid #e5e5e5;
  margin-left: 14px;
}

textarea:focus {
  box-shadow: none !important;
}
</style>
