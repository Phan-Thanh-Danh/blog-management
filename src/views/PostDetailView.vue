<template>
  <div class="container py-5">
    <!-- Hiển thị bài viết -->
    <div v-if="post" class="row">
      <div class="col-lg-8 mx-auto">
        <!-- Card bài viết chính -->
        <div class="card shadow-sm mb-4 post-detail-card">
          <!-- Hình ảnh bài viết -->
          <!-- Hình ảnh bài viết -->
          <!-- Hình ảnh bài viết (Grid Layout) -->
          <div v-if="displayImages.length > 0" class="mb-4">
            <div 
              class="grid-layout" 
              :class="getGridClass(displayImages.length)"
            >
              <div 
                v-for="(img, index) in displayImages.slice(0, 4)" 
                :key="index" 
                class="grid-item"
                @click="openLightbox(index)"
              >
                <img :src="img" :alt="post.title">
                <div v-if="index === 3 && displayImages.length > 4" class="more-overlay">
                  +{{ displayImages.length - 4 }}
                </div>
              </div>
            </div>
          </div>

          <!-- Lightbox Modal -->
          <div v-if="lightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
            <button class="btn-close-lightbox" @click="closeLightbox">
              <i class="bi bi-x-lg"></i>
            </button>
            
            <button 
              class="btn-nav prev" 
              @click.stop="prevImage" 
              v-if="displayImages.length > 1"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            
            <div class="lightbox-content">
              <img :src="displayImages[currentImageIndex]" class="lightbox-img" alt="Fullscreen">
              <div class="lightbox-counter">
                {{ currentImageIndex + 1 }} / {{ displayImages.length }}
              </div>
            </div>

            <button 
              class="btn-nav next" 
              @click.stop="nextImage" 
              v-if="displayImages.length > 1"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          
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
                <label class="form-label">Hình ảnh minh họa</label>
                <input 
                  type="file" 
                  @change="handleEditImageUpload"
                  class="form-control mb-2"
                  accept="image/*"
                >
                <div v-if="editForm.image" class="position-relative d-inline-block">
                  <img 
                    :src="editForm.image" 
                    height="100" 
                    class="rounded border" 
                    alt="Preview"
                  >
                  <button 
                    @click="removeEditImage" 
                    type="button" 
                    class="btn btn-danger btn-sm position-absolute top-0 end-0"
                    style="transform: translate(50%, -50%); padding: 0.1rem 0.3rem;"
                  >
                    &times;
                  </button>
                </div>
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

// Lightbox state
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
let editModal = null

// Computed: Lấy bài viết
const post = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.posts.find(p => p.id === postId)
})

const getGridClass = (count) => {
  if (count <= 1) return 'cols-1'
  if (count === 2) return 'cols-2'
  if (count === 3) return 'cols-3'
  return 'cols-4'
}

const openLightbox = (index) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden' // Disable scroll
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = '' // Enable scroll
}

const prevImage = () => {
  const total = displayImages.value.length
  currentImageIndex.value = (currentImageIndex.value - 1 + total) % total
}

const nextImage = () => {
  const total = displayImages.value.length
  currentImageIndex.value = (currentImageIndex.value + 1) % total
}

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

// Computed: Lấy danh sách ảnh
const displayImages = computed(() => {
  if (!post.value) return []
  if (post.value.images && post.value.images.length > 0) {
    return post.value.images
  }
  if (post.value.image) {
    return [post.value.image]
  }
  return []
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
    const modalEl = document.getElementById('editPostModal')
    if (modalEl) editModal = new Modal(modalEl)
  }
  if (editModal) editModal.show()
}

const handleEditImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn (tối đa 2MB)')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeEditImage = () => {
  editForm.value.image = ''
  // Try to clear input if currently in DOM
  const fileInput = document.querySelector('#editPostModal input[type="file"]')
  if (fileInput) fileInput.value = ''
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

/* Images Grid Styles */
.grid-layout {
    display: grid;
    gap: 4px;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    background: #f0f0f0;
}

.grid-layout.cols-1 { grid-template-columns: 1fr; }
.grid-layout.cols-1 .grid-item img { 
  max-height: 500px; 
  width: 100%;
  object-fit: contain; 
}

.grid-layout.cols-2 { 
  aspect-ratio: 16/9;
  grid-template-columns: 1fr 1fr; 
}

.grid-layout.cols-3 { 
    aspect-ratio: 16/9;
    grid-template-columns: 1.5fr 1fr; 
    grid-template-rows: 1fr 1fr;
}
.grid-layout.cols-3 .grid-item:first-child { grid-row: span 2; } 

.grid-layout.cols-4 { 
  aspect-ratio: 16/9;
  grid-template-columns: 1fr 1fr; 
  grid-template-rows: 1fr 1fr; 
}

.grid-item {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
}

.grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.grid-item:hover img {
    transform: scale(1.05);
}

.more-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: bold;
    backdrop-filter: blur(2px);
}

/* Lightbox Styles */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.lightbox-counter {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.btn-close-lightbox {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10000;
}

.btn-close-lightbox:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10000;
}

.btn-nav:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.btn-nav.prev {
  left: 20px;
}

.btn-nav.next {
  right: 20px;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.5rem;
  }
  
  .post-content {
    font-size: 1rem;
  }

  .grid-layout {
      gap: 2px;
  }
  
  .btn-nav {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>