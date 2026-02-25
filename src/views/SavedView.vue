<template>
  <div class="saved-page min-vh-100 pt-4 pb-5">
    <div class="container" style="max-width: 680px;">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <h4 class="fw-bold mb-0"><i class="bi bi-bookmark-fill text-warning me-2"></i>Bài viết đã lưu</h4>
        <span class="badge bg-light border text-dark ms-3 fw-semibold">{{ bookmarked.length }}</span>
      </div>

      <!-- Empty state -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-5">
        <i class="bi bi-lock display-4 text-muted d-block mb-3"></i>
        <h5>Vui lòng đăng nhập</h5>
        <router-link to="/login" class="btn btn-primary mt-3">Đăng nhập</router-link>
      </div>

      <div v-else-if="bookmarked.length === 0" class="empty-state text-center py-5">
        <div class="empty-icon mb-3"><i class="bi bi-bookmark"></i></div>
        <h5 class="fw-bold">Chưa có bài viết nào được lưu</h5>
        <p class="text-muted">Nhấn vào biểu tượng <i class="bi bi-bookmark"></i> trên bài viết để lưu lại đọc sau.</p>
        <router-link to="/" class="btn btn-primary mt-3 rounded-pill px-4">Khám phá ngay</router-link>
      </div>

      <!-- Post list -->
      <div v-else>
        <TransitionGroup name="saved-list">
          <div v-for="post in bookmarked" :key="post.id" class="saved-post-card mb-3">
            <!-- Remove bookmark button -->
            <button
              class="unsave-btn"
              @click.stop="unsave(post.id)"
              title="Bỏ lưu"
            >
              <i class="bi bi-bookmark-fill"></i>
            </button>

            <router-link :to="`/post/${post.id}`" class="saved-link">
              <!-- Thumbnail -->
              <div v-if="post.images?.length > 0 || post.image" class="saved-thumb">
                <img :src="post.images?.[0] || post.image" :alt="post.title">
              </div>

              <!-- Content -->
              <div class="saved-content flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <img :src="post.authorAvatar" class="saved-avatar" :alt="post.authorName">
                  <span class="small fw-semibold text-muted">{{ post.authorName }}</span>
                  <span class="text-muted small">·</span>
                  <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
                </div>
                <h6 class="fw-bold mb-1 saved-title">{{ post.title }}</h6>
                <p v-if="post.summary" class="saved-summary text-muted mb-2">{{ truncate(post.summary, 100) }}</p>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-light border text-dark fw-semibold small">{{ post.category }}</span>
                  <small class="text-muted">
                    <i class="bi bi-hand-thumbs-up me-1"></i>{{ authStore.getPostLikesCount(post.id) }}
                    <i class="bi bi-chat ms-2 me-1"></i>{{ getCommentCount(post.id) }}
                  </small>
                </div>
              </div>
            </router-link>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDialogStore } from '../stores/dialog'

const authStore = useAuthStore()
const dialogStore = useDialogStore()

const bookmarked = computed(() => authStore.bookmarkedPostsList)

const unsave = async (postId) => {
  const confirmed = await dialogStore.confirm('Bỏ lưu bài viết này?', 'Bỏ lưu')
  if (confirmed) authStore.toggleBookmark(postId)
}

const getCommentCount = (postId) => authStore.comments.filter(c => c.postId === postId).length

const truncate = (str, len) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.saved-page { background: #f0f2f5; }

.saved-post-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.18s;
}
.saved-post-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

.unsave-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(255,255,255,0.9);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  cursor: pointer;
  transition: all 0.18s;
  font-size: 0.95rem;
}
.unsave-btn:hover { background: #fef3c7; border-color: #f59e0b; }

.saved-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  gap: 0;
}

.saved-thumb {
  width: 130px;
  flex-shrink: 0;
  background: #f3f4f6;
  overflow: hidden;
}
.saved-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.saved-content {
  padding: 16px;
  min-width: 0;
}

.saved-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.saved-title {
  font-size: 0.95rem;
  color: #111827;
  line-height: 1.4;
  font-family: 'Inter', sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.saved-summary {
  font-size: 0.8rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* Empty State */
.empty-state .empty-icon { font-size: 3.5rem; color: #9ca3af; }

/* Transitions */
.saved-list-enter-active { transition: all 0.25s ease; }
.saved-list-leave-active { transition: all 0.2s ease; }
.saved-list-enter-from { opacity: 0; transform: translateY(-8px); }
.saved-list-leave-to  { opacity: 0; transform: translateX(20px); }
</style>
