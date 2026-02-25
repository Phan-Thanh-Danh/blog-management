<template>
  <div class="post-detail-page bg-light min-vh-100 pt-4 pb-5">
    <div v-if="post" class="container">
      <div class="row g-4">
        <!-- 1. Main Content Column -->
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 mb-4 post-card bg-white">
            <div class="card-body p-3 p-md-4">
              <!-- Author Header (Facebook style) -->
              <div class="d-flex align-items-center mb-4">
                <router-link :to="`/profile/${post.authorId}`" class="text-decoration-none">
                  <img :src="post.authorAvatar" class="rounded-circle border me-3" width="45" height="45" style="object-fit: cover;">
                </router-link>
                <div class="flex-grow-1">
                  <router-link :to="`/profile/${post.authorId}`" class="text-decoration-none text-dark">
                    <h6 class="fw-bold mb-0 hover-underline">{{ post.authorName }}</h6>
                  </router-link>
                  <div class="d-flex align-items-center gap-1">
                    <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
                    <span class="text-muted small">•</span>
                    <i class="bi bi-globe text-muted x-small"></i>
                  </div>
                </div>
                <div v-if="authStore.user && authStore.user.id === post.authorId" class="dropdown">
                  <button class="btn btn-ghost-dark btn-sm rounded-circle p-0" style="width: 32px; height: 32px;" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                    <li><a class="dropdown-item" href="#" @click.prevent="editPost"><i class="bi bi-pencil me-2"></i>Chỉnh sửa</a></li>
                    <li><a class="dropdown-item text-danger" href="#" @click.prevent="deletePost"><i class="bi bi-trash me-2"></i>Xóa bài viết</a></li>
                  </ul>
                </div>
              </div>

              <!-- Content Area -->
              <h3 class="fw-bold mb-3 px-1">{{ isTranslated ? translatedTitle : post.title }}</h3>
              
              <!-- AI Translation Badge -->
              <div v-if="isTranslated" class="px-1 mb-2">
                <span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-2">
                  <i class="bi bi-translate me-2"></i>Đã dịch sang {{ targetLanguageLabel }}
                  <button @click="resetTranslation" class="btn btn-sm p-0 ms-2 text-info fw-bold" style="font-size: 10px;">(Xem bản gốc)</button>
                </span>
              </div>

              <div class="post-body-content px-1 mb-4" v-html="displayContent" @click="handleContentClick"></div>

              <!-- Image Grid -->
              <div v-if="displayImages.length > 0" class="image-grid-section -mx-3 mb-4">
                <div class="grid-layout" :class="getGridClass(displayImages.length)">
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

              <!-- Engagement Stats -->
              <div class="d-flex justify-content-between align-items-center px-1 py-1">
                <div class="d-flex align-items-center">
                  <div class="icon-circle bg-primary text-white me-2">
                    <i class="bi bi-hand-thumbs-up-fill" style="font-size: 10px;"></i>
                  </div>
                  <span class="text-muted small">{{ likesCount }} người thích</span>
                </div>
                <div class="text-muted small">
                  {{ totalCommentsCount }} bình luận • 0 lượt chia sẻ
                </div>
              </div>

              <hr class="my-3 opacity-10">

              <!-- Action Bar -->
              <div class="d-flex justify-content-between px-1 mb-2">
                <button 
                  @click="handleLike" 
                  class="btn flex-grow-1 action-btn py-2"
                  :class="{ 'text-black active-btn': isLiked }"
                >
                  <i class="bi" :class="isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'"></i>
                  <span class="ms-2 fw-semibold">Thích</span>
                </button>
                <button @click="focusCommentInput" class="btn flex-grow-1 action-btn py-2">
                  <i class="bi bi-chat-left"></i>
                  <span class="ms-2 fw-semibold">Bình luận</span>
                </button>
                <button @click="sharePost" class="btn flex-grow-1 action-btn py-2">
                  <i class="bi bi-share"></i>
                  <span class="ms-2 fw-semibold">Chia sẻ</span>
                </button>
                <button 
                  @click="handleTranslate" 
                  class="btn flex-grow-1 action-btn py-2"
                  :disabled="isTranslating"
                >
                  <span v-if="isTranslating" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  <i v-else class="bi bi-translate"></i>
                  <span class="ms-2 fw-semibold">{{ isTranslated ? 'Đã dịch' : 'Dịch' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Card -->
          <div class="card shadow-sm border-0 bg-white p-3 p-md-4">
            <h6 class="fw-bold mb-4">Bình luận</h6>
            
            <!-- Comment Input -->
            <div v-if="authStore.isAuthenticated" class="d-flex gap-2 mb-4">
              <img :src="authStore.user.avatar" class="rounded-circle border" width="36" height="36" style="object-fit: cover;">
              <div class="flex-grow-1">
                 <textarea 
                   ref="commentInput"
                   v-model="commentContent" 
                   class="form-control bg-light border-0 rounded-4 px-3 py-2" 
                   rows="1" 
                   placeholder="Viết bình luận..." 
                   style="resize: none;"
                   @keydown.enter.prevent="handleAddComment"
                 ></textarea>
                 <small class="text-muted mt-1 d-block ms-2" style="font-size: 11px;">Nhấn Enter để đăng</small>
              </div>
            </div>
            <div v-else class="alert alert-light border rounded-3 mb-4 py-2 px-3 small">
              Vui lòng <router-link to="/login" class="fw-bold text-decoration-none">đăng nhập</router-link> để bình luận.
            </div>

            <!-- Comment List -->
            <div v-if="postComments.length > 0" class="comments-list">
              <CommentItem 
                v-for="comment in postComments" 
                :key="comment.id" 
                :comment="comment"
                :post-id="parseInt(route.params.id)"
              />
            </div>
            <div v-else class="text-center py-4 opacity-50">
              <i class="bi bi-chat-dots display-6"></i>
              <p class="mt-2 mb-0 small">Hãy là người đầu tiên bình luận!</p>
            </div>
          </div>
        </div>

        <!-- 2. Sidebar: Author Info & Recommendations -->
        <div class="col-lg-4">
          <div class="sticky-top" style="top: 80px;">
            <div class="card shadow-sm border-0 author-sidebar-card mb-4 bg-white overflow-hidden">
               <div class="sidebar-cover bg-primary opacity-25" style="height: 100px;"></div>
               <div class="card-body text-center pt-0 position-relative">
                  <router-link :to="`/profile/${post.authorId}`">
                    <img 
                      :src="post.authorAvatar" 
                      class="rounded-circle border border-4 border-white position-absolute start-50 translate-middle-x" 
                      width="90" height="90" 
                      style="top: -45px; object-fit: cover; background-color: #f0f2f5;"
                    >
                  </router-link>
                  <div style="margin-top: 55px;">
                    <router-link :to="`/profile/${post.authorId}`" class="text-decoration-none text-dark">
                      <h5 class="fw-bold mb-1 hover-underline">{{ post.authorName }}</h5>
                    </router-link>
                    <p v-if="authorBio" class="text-muted small px-3 mb-3">{{ authorBio }}</p>
                    
                    <div class="d-flex justify-content-center gap-4 mb-4">
                       <div class="stat-item text-center">
                          <div class="fw-bold">{{ authorPostsCount }}</div>
                          <div class="text-muted x-small text-uppercase fw-semibold">Bài viết</div>
                       </div>
                       <div class="stat-item text-center">
                          <div class="fw-bold">{{ followersCount }}</div>
                          <div class="text-muted x-small text-uppercase fw-semibold">Người theo dõi</div>
                       </div>
                    </div>

                    <button 
                      v-if="authStore.user && authStore.user.id !== post.authorId" 
                      @click="handleToggleFollow" 
                      class="btn w-75 fw-bold mb-3"
                      :class="authStore.isFollowing(post.authorId) ? 'btn-light border' : 'btn-primary'"
                    >
                      <i class="bi" :class="authStore.isFollowing(post.authorId) ? 'bi-person-check-fill' : 'bi-person-plus-fill'"></i>
                      <span class="ms-2">{{ authStore.isFollowing(post.authorId) ? 'Đang theo dõi' : 'Theo dõi' }}</span>
                    </button>
                    
                    <button v-else-if="authStore.user && authStore.user.id === post.authorId" @click="$router.push('/profile')" class="btn btn-light border w-75 fw-bold mb-3">
                      Quản lý tài khoản
                    </button>
                  </div>
               </div>
            </div>

            <!-- Footer Small -->
            <div class="px-2 text-muted x-small opacity-50 text-center">
               <div class="d-flex flex-wrap justify-content-center gap-2">
                 <span>Giới thiệu</span> • <span>Hỗ trợ</span> • <span>Điều khoản</span> • <span>Quyền riêng tư</span>
               </div>
               <div class="mt-1">MyBlog © 2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="container py-5 text-center">
      <div class="py-5 bg-white shadow-sm rounded-3">
        <i class="bi bi-exclamation-octagon display-1 text-danger opacity-25"></i>
        <h2 class="mt-4 fw-bold">Không tìm thấy bài viết</h2>
        <p class="text-muted mb-4">Bài viết này có thể đã bị xóa hoặc liên kết không chính xác.</p>
        <router-link to="/" class="btn btn-primary rounded-pill px-5 fw-bold">Về trang chủ</router-link>
      </div>
    </div>

    <!-- Edit Modal (Preserve Logic) -->
    <PostModal 
      ref="postModalRef"
      mode="edit"
      :initial-data="post"
      @saved="() => {}"
    />

    <!-- Lightbox (Preserve Logic) -->
    <div v-if="lightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
      <button class="btn-close-lightbox" @click="closeLightbox"><i class="bi bi-x-lg"></i></button>
      <button class="btn-nav prev" @click.stop="prevImage" v-if="displayImages.length > 1"><i class="bi bi-chevron-left"></i></button>
      <div class="lightbox-content">
        <img :src="displayImages[currentImageIndex]" class="lightbox-img" alt="Fullscreen">
        <div class="lightbox-counter">{{ currentImageIndex + 1 }} / {{ displayImages.length }}</div>
      </div>
      <button class="btn-nav next" @click.stop="nextImage" v-if="displayImages.length > 1"><i class="bi bi-chevron-right"></i></button>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDialogStore } from '../stores/dialog'
import CommentItem from '../components/CommentItem.vue'
import PostModal from '../components/PostModal.vue'
import { translateHTMLContent } from '../utils/geminiService'
import { useNotificationStore } from '../stores/notification'

const notificationStore = useNotificationStore()
const dialogStore = useDialogStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const commentContent = ref('')
const commentInput = ref(null)
const postModalRef = ref(null)

// Translation state
const isTranslating = ref(false)
const translatedContent = ref('')
const translatedTitle = ref('')
const isTranslated = ref(false)
const targetLanguageLabel = ref('')

// Lightbox state
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

// Computed: Lấy bài viết
const post = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.posts.find(p => p.id === postId)
})

const author = computed(() => {
  if (!post.value) return null
  return authStore.users.find(u => u.id === post.value.authorId)
})

const authorBio = computed(() => author.value?.bio || 'Chưa có tiểu sử.')
const authorPostsCount = computed(() => authStore.posts.filter(p => p.authorId === post.value?.authorId).length)
const followersCount = computed(() => authStore.users.filter(u => u.following && u.following.includes(post.value?.authorId)).length)

const getGridClass = (count) => {
  if (count <= 1) return 'cols-1'
  if (count === 2) return 'cols-2'
  if (count === 3) return 'cols-3'
  return 'cols-4'
}

const openLightbox = (index) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

const prevImage = () => {
  const total = displayImages.value.length
  currentImageIndex.value = (currentImageIndex.value - 1 + total) % total
}

const nextImage = () => {
  const total = displayImages.value.length
  currentImageIndex.value = (currentImageIndex.value + 1) % total
}

const postComments = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.getPostComments(postId)
})

const totalCommentsCount = computed(() => {
  const postId = parseInt(route.params.id)
  return authStore.comments.filter(c => c.postId === postId).length
})

const likesCount = computed(() => {
  return authStore.getPostLikesCount(parseInt(route.params.id))
})

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

const isLiked = computed(() => {
  return authStore.isPostLiked(parseInt(route.params.id))
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const handleAddComment = () => {
  if (!commentContent.value.trim()) return
  try {
    const postId = parseInt(route.params.id)
    authStore.createComment(postId, commentContent.value)
    commentContent.value = ''
  } catch (error) {
    dialogStore.alert(error.message, 'error')
  }
}

const handleLike = () => {
  if (!authStore.isAuthenticated) {
    dialogStore.alert('Bạn cần đăng nhập để thích bài viết', 'info', 'Yêu cầu đăng nhập')
    return
  }
  try {
    authStore.toggleLike(parseInt(route.params.id))
  } catch (error) {
    dialogStore.alert(error.message, 'error')
  }
}

const handleToggleFollow = () => {
  try {
    authStore.toggleFollow(post.value.authorId)
  } catch (error) {
    dialogStore.alert(error.message, 'error')
  }
}

const sharePost = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    notificationStore.addNotification({ type: 'success', title: 'Sao chép liên kết', message: 'Đã sao chép vào bộ nhớ!' })
  })
}

const focusCommentInput = () => {
  if (authStore.isAuthenticated) {
    commentInput.value?.focus()
  } else {
    dialogStore.alert('Vui lòng đăng nhập để bình luận', 'info', 'Yêu cầu đăng nhập')
  }
}

const displayContent = computed(() => {
  const contentToFormat = isTranslated.value ? translatedContent.value : (post.value?.content || '')
  return contentToFormat.replace(/(^|\s)(#[\w\u00C0-\u1EF9]+)/g, (match, p1, p2) => {
    return `${p1}<a href="/?search=${encodeURIComponent(p2)}" class="hashtag-link text-primary text-decoration-none fw-bold" data-hashtag="${p2}">${p2}</a>`
  })
})

const handleTranslate = async () => {
  if (isTranslated.value) return
  
  try {
    isTranslating.value = true
    const result = await translateHTMLContent({
      title: post.value.title,
      content: post.value.content
    })
    
    if (result && typeof result === 'object') {
      translatedTitle.value = result.title
      translatedContent.value = result.content
      targetLanguageLabel.value = result.targetLanguage || 'Tiếng Anh'
      isTranslated.value = true
      
      notificationStore.addNotification({
        type: 'success',
        title: 'Đã dịch',
        message: `Tiêu đề và nội dung đã được dịch sang ${targetLanguageLabel.value}.`
      })
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Lỗi dịch thuật',
      message: error.message
    })
  } finally {
    isTranslating.value = false
  }
}

const resetTranslation = () => {
  isTranslated.value = false
}

const handleContentClick = (event) => {
  const target = event.target
  if (target.classList.contains('hashtag-link')) {
    event.preventDefault()
    const hashtag = target.getAttribute('data-hashtag')
    router.push({ path: '/', query: { search: hashtag } })
  }
}

const editPost = () => {
  postModalRef.value?.show()
}

const deletePost = async () => {
  const confirmed = await dialogStore.confirm('Bạn có chắc chắn muốn xóa bài viết này?', 'Xóa bài viết')
  if (confirmed) {
    try {
      authStore.deletePost(post.value.id)
      notificationStore.addNotification({ type: 'success', title: 'Xóa thành công', message: 'Bài viết đã được xóa.' })
      router.push('/')
    } catch (error) {
      dialogStore.alert(error.message, 'error')
    }
  }
}
</script>

<style scoped>
.post-detail-page {
  background-color: #f0f2f5;
}

.post-card {
  border-radius: 12px;
}

.post-body-content {
  font-size: 1.05rem;
  line-height: 1.6;
}

.image-grid-section {
  margin-left: -1rem;
  margin-right: -1rem;
}

.action-btn {
  border: none;
  background: transparent;
  color: #65676b;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background-color: #f2f2f2;
}

.active-btn {
  color: #0866ff !important;
}

.icon-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.x-small { font-size: 0.75rem; }

.hover-underline:hover {
  text-decoration: underline !important;
}

.author-sidebar-card {
  border-radius: 12px;
}

.sidebar-cover {
  background: linear-gradient(to bottom, #0866ff, #4b91ff);
}

.ls-1 { letter-spacing: 0.5px; }

/* Grid Styles (Consistent with PostCard) */
.grid-layout {
  display: grid;
  gap: 2px;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #f0f2f5;
}

.grid-layout.cols-1 { grid-template-columns: 1fr; aspect-ratio: auto; }
.grid-layout.cols-1 .grid-item img { max-height: 600px; width: 100%; object-fit: contain; }

.grid-layout.cols-2 { grid-template-columns: 1fr 1fr; }
.grid-layout.cols-3 { 
  grid-template-columns: 1.5fr 1fr; 
  grid-template-rows: 1fr 1fr;
}
.grid-layout.cols-3 .grid-item:first-child { grid-row: span 2; } 
.grid-layout.cols-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.grid-item {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.grid-item img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}

.more-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 2.5rem; font-weight: bold;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex; align-items: center; justify-content: center;
}

.lightbox-content { position: relative; max-width: 90vw; max-height: 90vh; }
.lightbox-img { max-width: 100%; max-height: 90vh; object-fit: contain; }
.lightbox-counter { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); color: white; }

.btn-close-lightbox, .btn-nav {
  position: absolute; background: rgba(255, 255, 255, 0.1); border: none;
  color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; cursor: pointer;
}

.btn-close-lightbox { top: 20px; right: 20px; width: 44px; height: 44px; font-size: 1.5rem; }
.btn-nav { top: 50%; transform: translateY(-50%); width: 50px; height: 50px; font-size: 1.5rem; }
.btn-nav.prev { left: 20px; }
.btn-nav.next { right: 20px; }

@media (max-width: 991px) {
  .post-detail-page { padding-top: 1rem !important; }
}
</style>
