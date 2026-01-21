<template>
  <div class="container py-5">
    <!-- Hiển thị bài viết -->
    <div v-if="post" class="row">
      <div class="col-md-8 mx-auto">
        <!-- Card bài viết chính -->
        <div class="card shadow-sm mb-4">
          <!-- Hình ảnh bài viết (nếu có) -->
          <img 
            v-if="post.image" 
            :src="post.image" 
            class="card-img-top" 
            :alt="post.title" 
            style="max-height: 400px; object-fit: cover;"
          >
          
          <div class="card-body p-4">
            <!-- Tiêu đề bài viết -->
            <h1 class="card-title mb-4">{{ post.title }}</h1>
            
            <!-- Thông tin tác giả -->
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
              <img 
                :src="post.authorAvatar" 
                class="rounded-circle me-3" 
                width="48" 
                height="48" 
                :alt="post.authorName"
              >
              <div>
                <strong class="d-block">{{ post.authorName }}</strong>
                <small class="text-muted">
                  <i class="bi bi-clock"></i> {{ formatDate(post.createdAt) }}
                </small>
              </div>
            </div>

            <!-- Nội dung bài viết -->
            <div class="post-content" style="white-space: pre-wrap; line-height: 1.8;">
              {{ post.content }}
            </div>

            <!-- Nút quay lại -->
            <div class="mt-4 pt-3 border-top">
              <router-link to="/" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left"></i> Quay lại trang chủ
              </router-link>
            </div>
          </div>
        </div>

        <!-- Card phần bình luận -->
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h4 class="mb-4">
              <i class="bi bi-chat-dots"></i> Bình luận ({{ postComments.length }})
            </h4>

            <!-- Form thêm bình luận (chỉ hiển thị khi đã đăng nhập) -->
            <div v-if="authStore.isAuthenticated" class="mb-4 pb-4 border-bottom">
              <form @submit.prevent="handleAddComment">
                <div class="d-flex gap-2 align-items-start">
                  <img 
                    :src="authStore.user.avatar" 
                    class="rounded-circle" 
                    width="40" 
                    height="40" 
                    :alt="authStore.user.name"
                  >
                  <div class="flex-grow-1">
                    <textarea 
                      v-model="commentContent" 
                      class="form-control mb-2" 
                      rows="3"
                      placeholder="Viết bình luận của bạn..."
                      required
                    ></textarea>
                    <button type="submit" class="btn btn-primary btn-sm">
                      <i class="bi bi-send"></i> Gửi bình luận
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Thông báo yêu cầu đăng nhập -->
            <div v-else class="alert alert-info mb-4">
              <i class="bi bi-info-circle"></i> 
              <router-link to="/login" class="alert-link">Đăng nhập</router-link> 
              để bình luận vào bài viết này
            </div>

            <!-- Danh sách bình luận -->
            <div v-if="postComments.length > 0" class="comments-list">
              <CommentItem 
                v-for="comment in postComments" 
                :key="comment.id" 
                :comment="comment"
              />
            </div>

            <!-- Thông báo chưa có bình luận -->
            <div v-else class="text-center py-5">
              <i class="bi bi-chat-square-text text-muted" style="font-size: 3rem;"></i>
              <p class="text-muted mt-3">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thông báo không tìm thấy bài viết -->
    <div v-else class="row">
      <div class="col-md-6 mx-auto text-center py-5">
        <i class="bi bi-exclamation-triangle text-warning" style="font-size: 5rem;"></i>
        <h3 class="mt-3">Không tìm thấy bài viết</h3>
        <p class="text-muted mb-4">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <router-link to="/" class="btn btn-primary">
          <i class="bi bi-house"></i> Về trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CommentItem from '../components/CommentItem.vue'

// Khởi tạo route và store
const route = useRoute()
const authStore = useAuthStore()

// State cho nội dung bình luận
const commentContent = ref('')

// Computed: Lấy bài viết theo ID từ route params
const post = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.posts.find(p => p.id === postId)
})

// Computed: Lấy danh sách bình luận của bài viết
const postComments = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.getPostComments(postId)
})

// Hàm format ngày tháng
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

// Xử lý thêm bình luận
const handleAddComment = () => {
  // Kiểm tra nội dung bình luận không rỗng
  if (!commentContent.value.trim()) {
    alert('Vui lòng nhập nội dung bình luận')
    return
  }

  try {
    const postId = parseInt(route.params.id)
    authStore.createComment(postId, commentContent.value)
    
    // Reset form sau khi thêm thành công
    commentContent.value = ''
    
    // Hiển thị thông báo thành công (tùy chọn)
    // alert('Thêm bình luận thành công!')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.post-content {
  font-size: 1.1rem;
  color: #333;
}

.comments-list {
  max-height: 600px;
  overflow-y: auto;
}

/* Responsive cho mobile */
@media (max-width: 768px) {
  .post-content {
    font-size: 1rem;
  }
  
  h1.card-title {
    font-size: 1.5rem;
  }
}
</style>