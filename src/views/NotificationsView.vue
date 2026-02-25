<template>
  <div class="notifications-page min-vh-100 pt-4 pb-5">
    <div class="container" style="max-width: 680px;">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h4 class="fw-bold mb-0">Thông báo</h4>
        <div class="d-flex gap-2">
          <button
            v-if="myActivities.length > 0"
            class="btn btn-light btn-sm border fw-semibold"
            @click="markAll"
          >
            <i class="bi bi-check2-all me-1"></i>Đánh dấu đã đọc
          </button>
          <button
            v-if="myActivities.length > 0"
            class="btn btn-light btn-sm border fw-semibold text-danger"
            @click="clearNotifications"
          >
            <i class="bi bi-trash me-1"></i>Xóa tất cả
          </button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="notif-tabs mb-4">
        <button
          class="notif-tab-btn"
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >Tất cả</button>
        <button
          class="notif-tab-btn"
          :class="{ active: filter === 'unread' }"
          @click="filter = 'unread'"
        >Chưa đọc
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </button>
        <button
          class="notif-tab-btn"
          :class="{ active: filter === 'like' }"
          @click="filter = 'like'"
        ><i class="bi bi-heart me-1"></i>Lượt thích</button>
        <button
          class="notif-tab-btn"
          :class="{ active: filter === 'comment' }"
          @click="filter = 'comment'"
        ><i class="bi bi-chat me-1"></i>Bình luận</button>
        <button
          class="notif-tab-btn"
          :class="{ active: filter === 'follow' }"
          @click="filter = 'follow'"
        ><i class="bi bi-person me-1"></i>Theo dõi</button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredActivities.length === 0" class="empty-state text-center py-5">
        <div class="empty-icon mb-3">
          <i class="bi bi-bell-slash"></i>
        </div>
        <h5 class="fw-bold">Không có thông báo nào</h5>
        <p class="text-muted">Khi ai đó tương tác với bạn, thông báo sẽ hiển thị tại đây.</p>
      </div>

      <!-- Notifications list -->
      <div v-else class="notifications-list">
        <TransitionGroup name="notif-list">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="notif-item"
            :class="{ unread: !activity.read }"
            @click="handleClick(activity)"
          >
            <!-- Unread dot -->
            <div class="unread-dot" v-if="!activity.read"></div>

            <!-- Actor Avatar -->
            <img
              :src="activity.actorAvatar || 'https://ui-avatars.com/api/?name=User'"
              class="notif-avatar"
              :alt="activity.actorName"
            />

            <!-- Icon overlay -->
            <span class="notif-type-icon" :class="activity.type">
              <i :class="typeIcon(activity.type)"></i>
            </span>

            <!-- Content -->
            <div class="notif-content flex-grow-1">
              <p class="notif-text mb-1">
                <strong>{{ activity.actorName }}</strong>
                {{ typeLabel(activity) }}
                <span v-if="activity.postTitle" class="text-primary fw-semibold">
                  "{{ truncate(activity.postTitle, 40) }}"
                </span>
              </p>
              <p v-if="activity.commentContent" class="notif-comment-preview mb-1">
                {{ truncate(activity.commentContent, 60) }}
              </p>
              <small class="text-muted">{{ formatTime(activity.createdAt) }}</small>
            </div>

            <!-- Chevron -->
            <i class="bi bi-chevron-right text-muted ms-2 flex-shrink-0"></i>
          </div>
        </TransitionGroup>
      </div>

      <!-- Không đăng nhập -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-5">
        <i class="bi bi-lock display-4 text-muted mb-3 d-block"></i>
        <h5>Vui lòng đăng nhập để xem thông báo</h5>
        <router-link to="/login" class="btn btn-primary mt-3">Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useActivityStore } from '../stores/activity'

const router = useRouter()
const authStore = useAuthStore()
const activityStore = useActivityStore()

const filter = ref('all')

const myActivities = computed(() => {
  if (!authStore.user) return []
  return activityStore.getMyActivities(authStore.user.id)
})

const unreadCount = computed(() => {
  if (!authStore.user) return 0
  return activityStore.getUnreadCount(authStore.user.id)
})

const filteredActivities = computed(() => {
  if (filter.value === 'unread') return myActivities.value.filter(a => !a.read)
  if (filter.value === 'like') return myActivities.value.filter(a => a.type === 'like')
  if (filter.value === 'comment') return myActivities.value.filter(a => a.type === 'comment' || a.type === 'reply')
  if (filter.value === 'follow') return myActivities.value.filter(a => a.type === 'follow')
  return myActivities.value
})

const markAll = () => {
  if (authStore.user) activityStore.markAllRead(authStore.user.id)
}

const clearNotifications = () => {
  if (authStore.user) activityStore.clearAll(authStore.user.id)
}

const handleClick = (activity) => {
  activityStore.markRead(activity.id)
  if (activity.postId) {
    router.push(`/post/${activity.postId}`)
  } else if (activity.type === 'follow' && activity.actorId) {
    router.push(`/profile/${activity.actorId}`)
  }
}

const typeIcon = (type) => {
  const icons = {
    like: 'bi bi-heart-fill',
    comment: 'bi bi-chat-fill',
    reply: 'bi bi-reply-fill',
    follow: 'bi bi-person-fill',
    bookmark: 'bi bi-bookmark-fill'
  }
  return icons[type] || 'bi bi-bell-fill'
}

const typeLabel = (activity) => {
  const labels = {
    like: 'đã thích bài viết của bạn',
    comment: 'đã bình luận về bài viết',
    reply: 'đã phản hồi bình luận của bạn',
    follow: 'đã bắt đầu theo dõi bạn',
    bookmark: 'đã lưu bài viết của bạn'
  }
  return labels[activity.type] || 'đã tương tác'
}

const truncate = (str, len) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
.notifications-page {
  background: #f0f2f5;
}

/* Tabs */
.notif-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notif-tab-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
}
.notif-tab-btn.active {
  background: #1d4ed8;
  color: #fff;
  border-color: #1d4ed8;
}
.notif-tab-btn:hover:not(.active) {
  background: #f3f4f6;
}

.unread-badge {
  background: #ef4444;
  color: #fff;
  border-radius: 99px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
  margin-left: 2px;
}

/* Notification Item */
.notif-item {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  transition: background 0.18s;
  border: 1px solid transparent;
}
.notif-item:hover { background: #f9fafb; }
.notif-item.unread { border-color: rgba(59, 130, 246, 0.2); background: #eff6ff; }
.notif-item.unread:hover { background: #dbeafe; }

.unread-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #3b82f6;
}

.notif-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
}

.notif-type-icon {
  position: absolute;
  left: 48px;
  bottom: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid #fff;
}
.notif-type-icon.like    { background: #ef4444; color: #fff; }
.notif-type-icon.comment { background: #3b82f6; color: #fff; }
.notif-type-icon.reply   { background: #8b5cf6; color: #fff; }
.notif-type-icon.follow  { background: #10b981; color: #fff; }
.notif-type-icon.bookmark{ background: #f59e0b; color: #fff; }

.notif-content {
  min-width: 0;
}
.notif-text {
  font-size: 0.9rem;
  color: #111827;
  line-height: 1.4;
  font-family: 'Inter', sans-serif;
  margin: 0;
}
.notif-comment-preview {
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-style: italic;
  margin: 0;
}

/* Empty State */
.empty-state .empty-icon {
  font-size: 3.5rem;
  color: #9ca3af;
}

/* List transition */
.notif-list-enter-active { transition: all 0.25s ease; }
.notif-list-leave-active { transition: all 0.2s ease; }
.notif-list-enter-from { opacity: 0; transform: translateY(-8px); }
.notif-list-leave-to  { opacity: 0; transform: translateX(20px); }
</style>
