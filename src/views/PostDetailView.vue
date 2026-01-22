<template>
  <div class="container py-5">
    <!-- Hiển thị bài viết -->
    <div v-if="post" class="row">
      <div class="col-lg-8 mx-auto">
        <!-- Card bài viết chính -->
        <div class="card shadow-sm mb-4 post-detail-card">
          <!-- Hình ảnh bài viết -->
          <img 
            v-if="post.image" 
            :src="post.image" 
            class="card-img-top" 
            :alt="post.title" 
            style="max-height: 500px; object-fit: cover;"
          >
          
          <div class="card-body p-4 p-md-5">
            <!-- Tiêu đề bài viết -->
            <h1 class="post-title mb-4">{{ post.title }}</h1>
            
            <!-- Thông tin tác giả -->
            <div class="author-info d-flex align-items-center mb-4 pb-4 border-bottom">
              <img 
                :src="post.authorAvatar" 
                class="rounded-circle me-3" 
                width="56" 
                height="56" 
                :alt="post.authorName"
              >
              <div class="flex-grow-1">
                <strong class="d-block fs-5">{{ post.authorName }}</strong>
                <small class="text-muted">
                  <i class="bi bi-clock"></i> {{ formatDate(post.createdAt) }}
                </small>
              </div>

              <!-- Edit & Delete cho tác giả -->
              <div v-if="authStore.user && authStore.user.id === post.authorId" class="ms-auto">
                <button @click="editPost" class="btn btn-warning btn-sm me-2">
                  <i class="bi bi-pencil"></i> Sửa
                </button>
                <button @click="deletePost" class="btn btn-danger btn-sm">
                  <i class="bi bi-trash"></i> Xóa
                </button>
              </div>
            </div>

            <!-- Nội dung bài viết -->
            <div class="post-content mb-4">
              {{ post.content }}
            </div>

            <!-- Like & Stats -->
            <div class="post-actions-detail border-top border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="stats d-flex gap-4">
                  <span class="text-muted">
                    <i class="bi bi-heart-fill text-danger"></i> {{ likesCount }} lượt thích
                  </span>
                  <span class="text-muted">
                    <i class="bi bi-chat-dots-fill text-primary"></i> {{ totalCommentsCount }} bình luận
                  </span>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button 
                  @click="handleLike" 
                  class="btn btn-lg flex-grow-1"
                  :class="isLiked ? 'btn-danger' : 'btn-outline-danger'"
                >
                  <i class="bi" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
                  {{ isLiked ? 'Đã thích' : 'Thích' }}
                </button>
              </div>
            </div>

            <!-- Nút quay lại -->
            <div class="mt-4">
              <router-link to="/" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left"></i> Quay lại trang chủ
              </router-link>
            </div>
          </div>
        </div>

        <!-- Card phần bình luận -->
        <div class="card shadow-sm comments-card">
          <div class="card-header bg-white py-3">
            <h4 class="mb-0">
              <i class="bi bi-chat-dots"></i> Bình luận ({{ postComments.length }})
            </h4>
          </div>
          
          <div class="card-body p-4">
            <!-- Form thêm bình luận -->
            <div v-if="authStore.isAuthenticated" class="mb-4 pb-4 border-bottom">
              <form @submit.prevent="handleAddComment">
                <div class="d-flex gap-3 align-items-start">
                  <img 
                    :src="authStore.user.avatar" 
                    class="rounded-circle" 
                    width="48" 
                    height="48" 
                    :alt="authStore.user.name"
                  >
                  <div class="flex-grow-1">
                    <textarea 
                      v-model="commentContent" 
                      class="form-control mb-3" 
                      rows="3"
                      placeholder="Chia sẻ suy nghĩ của bạn..."
                      required
                    ></textarea>
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-send"></i> Đăng bình luận
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Thông báo yêu cầu đăng nhập -->
            <div v-else class="alert alert-info">
              <i class="bi bi-info-circle"></i> 
              <router-link to="/login" class="alert-link fw-bold">Đăng nhập</router-link> 
              để tham gia thảo luận
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
            <div v-else class="text-center py-5 empty-comments">
              <i class="bi bi-chat-square-text text-muted" style="font-size: 4rem;"></i>
              <p class="text-muted mt-3 mb-0">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thông báo không tìm thấy bài viết -->
    <div v-else class="row">
      <div class="col-md-6 mx-auto text-center py-5">
        <i class="bi bi-exclamation-triangle text-warning" style="font-size: 5rem;"></i>
        <h3 class="mt-4">Không tìm thấy bài viết</h3>
        <p class="text-muted mb-4">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <router-link to="/" class="btn btn-primary">
          <i class="bi bi-house"></i> Về trang chủ
        </router-link>
      </div>
    </div>

    <!-- Modal Edit Post -->
    <div class="modal fade" id="editPostModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chỉnh sửa bài viết</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePost">
              <div class="mb-3">
                <label class="form-label">Tiêu đề</label>
                <input v-model="editForm.title" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung</label>
                <textarea v-model="editForm.content" class="form-control" rows="8" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Hình ảnh (URL)</label>
                <input v-model="editForm.image" type="url" class="form-control">
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-circle"></i> Cập nhật
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CommentItem from '../components/CommentItem.vue'
import { Modal } from 'bootstrap'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const commentContent = ref('')
const editForm = ref({
  id: null,
  title: '',
  content: '',
  image: ''
})

let editModal = null

// Computed: Lấy bài viết
const post = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.posts.find(p => p.id === postId)
})

// Computed: Lấy comments
const postComments = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.getPostComments(postId)
})

// Computed: Tổng số comments (bao gồm replies)
const totalCommentsCount = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.comments.filter(c => c.postId === postId).length
})

// Computed: Số likes
const likesCount = computed(() => {
  return authStore.getPostLikesCount(parseInt(route.params.id))
})

// Computed: Đã like chưa
const isLiked = computed(() => {
  return authStore.isPostLiked(parseInt(route.params.id))
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

const handleAddComment = () => {
  if (!commentContent.value.trim()) {
    alert('Vui lòng nhập nội dung bình luận')
    return
  }

  try {
    const postId = parseInt(route.params.id)
    authStore.createComment(postId, commentContent.value)
    commentContent.value = ''
  } catch (error) {
    alert(error.message)
  }
}

const handleLike = () => {
  if (!authStore.isAuthenticated) {
    alert('Bạn cần đăng nhập để thích bài viết')
    return
  }

  try {
    authStore.toggleLike(parseInt(route.params.id))
  } catch (error) {
    alert(error.message)
  }
}

const editPost = () => {
  if (!post.value) return
  
  editForm.value = {
    id: post.value.id,
    title: post.value.title,
    content: post.value.content,
    image: post.value.image
  }
  
  if (!editModal) {
    editModal = new Modal(document.getElementById('editPostModal'))
  }
  editModal.show()
}

const updatePost = () => {
  try {
    authStore.updatePost(editForm.value.id, editForm.value)
    editModal.hide()
    alert('Cập nhật bài viết thành công!')
  } catch (error) {
    alert(error.message)
  }
}

const deletePost = () => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    try {
      authStore.deletePost(post.value.id)
      alert('Xóa bài viết thành công!')
      router.push('/')
    } catch (error) {
      alert(error.message)
    }
  }
}
</script>

<style scoped>
.post-detail-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.post-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.author-info img {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.post-actions-detail {
  margin: 2rem 0;
}

.stats {
  font-size: 1rem;
}

.comments-card {
  border: none;
  border-radius: 12px;
}

.comments-list {
  max-height: none;
}

.empty-comments i {
  opacity: 0.3;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.5rem;
  }
  
  .post-content {
    font-size: 1rem;
  }
}
</style>