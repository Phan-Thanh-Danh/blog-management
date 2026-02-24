<template>
  <div class="card mb-3 shadow-none border-0 post-card bg-white cursor-pointer" @click="handleCardClick">
    <div class="card-body p-3">
      <!-- 1. Author Header -->
      <div class="d-flex align-items-center mb-3">
        <router-link :to="`/profile/${post.authorId}`" class="text-decoration-none">
          <img 
            :src="post.authorAvatar" 
            class="rounded-circle border me-2 cursor-pointer" 
            width="40" 
            height="40" 
            :alt="post.authorName"
            style="object-fit: cover;"
          >
        </router-link>
        <div class="flex-grow-1">
          <router-link :to="`/profile/${post.authorId}`" class="text-decoration-none text-dark">
            <strong class="d-block cursor-pointer hover-underline mb-0">{{ post.authorName }}</strong>
          </router-link>
          <div class="d-flex align-items-center gap-1">
            <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
            <span class="text-muted small">•</span>
            <i class="bi bi-globe text-muted x-small"></i>
          </div>
        </div>
        
        <!-- Author Actions Dropdown -->
        <div v-if="authStore.user && Number(authStore.user.id) === Number(post.authorId)" class="dropdown">
           <button 
             class="btn btn-ghost-dark btn-sm rounded-circle p-0 flex-center" 
             style="width: 32px; height: 32px;" 
             @click.stop="toggleDropdown"
             type="button"
           >
             <i class="bi bi-three-dots"></i>
           </button>
           <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" :class="{ show: showDropdown }">
             <li><a class="dropdown-item" href="#" @click.prevent="handleEdit"><i class="bi bi-pencil me-2"></i>Chỉnh sửa bài viết</a></li>
             <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleDeleteClick"><i class="bi bi-trash me-2"></i>Xóa bài viết</a></li>
           </ul>
        </div>
      </div>

      <!-- 2. Text Content -->
      <div class="post-text-content mb-3 px-1">
        <h6 v-if="post.title" class="fw-bold mb-2">{{ post.title }}</h6>
        <div v-if="post.summary" class="ai-summary mb-2 p-2 rounded-2 bg-light border-start border-primary border-4">
          <small class="text-muted d-block mb-1 small-badge"><i class="bi bi-stars text-primary me-1"></i>Tóm tắt bởi AI</small>
          <p class="card-text mb-0 fs-7 fst-italic">{{ post.summary }}</p>
        </div>
        <p v-else class="card-text mb-2 text-dark">{{ truncateContent(post.content, 250) }}</p>
        
        <!-- Hashtags -->
        <div v-if="post.tags && post.tags.length > 0" class="mb-2 d-flex flex-wrap gap-1">
          <span 
            v-for="tag in post.tags" 
            :key="tag"
            @click.stop="filterByHashtag(tag)"
            class="badge-hashtag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 3. Image Grid (Full width) -->
    <div 
      v-if="displayImages.length > 0" 
      class="grid-layout border-top border-bottom bg-light"
      :class="`cols-${Math.min(displayImages.length, 4)}`"
    >
      <div 
        v-for="(img, index) in displayImages.slice(0, 4)" 
        :key="index" 
        class="grid-item"
      >
        <img :src="img" :alt="post.title" loading="lazy">
        <div v-if="index === 3 && displayImages.length > 4" class="more-overlay">
          +{{ displayImages.length - 4 }}
        </div>
      </div>
    </div>

    <div class="card-body p-3 pt-2">
      <!-- 4. Engagement Bar (Stats) -->
      <div class="d-flex justify-content-between align-items-center px-1 mb-2">
         <div class="stats-icons d-flex align-items-center">
            <div class="icon-circle bg-primary text-white me-1">
               <i class="bi bi-hand-thumbs-up-fill" style="font-size: 10px;"></i>
            </div>
            <span class="text-muted small">{{ likesCount }}</span>
         </div>
         <div class="text-muted small">
            {{ commentsCount }} bình luận
         </div>
      </div>

      <hr class="my-2 mx-1 opacity-10">

      <!-- 5. Action Buttons -->
      <div class="d-flex justify-content-between px-1">
        <button 
          @click.stop="handleLike" 
          class="btn flex-grow-1 action-btn py-2"
          :class="{ 'text-primary active-btn': isLiked }"
        >
          <i class="bi" :class="isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'"></i>
          <span class="ms-2 fw-semibold">Thích</span>
        </button>
        <router-link :to="`/post/${post.id}`" class="btn flex-grow-1 action-btn py-2 text-decoration-none" @click.stop>
          <i class="bi bi-chat-left"></i>
          <span class="ms-2 fw-semibold">Bình luận</span>
        </router-link>
        <button class="btn flex-grow-1 action-btn py-2 d-none d-sm-block">
          <i class="bi bi-share"></i>
          <span class="ms-2 fw-semibold">Chia sẻ</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleEdit = () => {
  showDropdown.value = false
  emit('edit', props.post)
}

const handleDeleteClick = () => {
  showDropdown.value = false
  handleDelete()
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

const handleCardClick = (event) => {
  // Ignore click if it's on a button, link, or inside a dropdown
  if (
    event.target.closest('button') || 
    event.target.closest('a') || 
    event.target.closest('.dropdown') || 
    event.target.closest('.badge-hashtag')
  ) {
    return
  }
  router.push(`/post/${props.post.id}`)
}

const filterByHashtag = (tag) => {
  router.push({ path: '/', query: { search: tag } })
}

// Computed: Lấy danh sách ảnh để hiển thị
const displayImages = computed(() => {
  if (props.post.images && props.post.images.length > 0) {
    return props.post.images
  }
  if (props.post.image) {
    return [props.post.image]
  }
  return []
})

// Computed: Đếm số likes
const likesCount = computed(() => {
  return authStore.getPostLikesCount(props.post.id)
})

// Computed: Kiểm tra đã like chưa
const isLiked = computed(() => {
  return authStore.isPostLiked(props.post.id)
})

// Computed: Đếm số comments (bao gồm cả replies)
const commentsCount = computed(() => {
  return authStore.comments.filter(c => c.postId === props.post.id).length
})

// Computed: Tính thời gian đọc (giả sử 200 từ/phút)
const readingTime = computed(() => {
  const words = props.post.content.trim().split(/\s+/).length
  const time = Math.ceil(words / 200)
  return time < 1 ? 1 : time
})

const truncateContent = (text, length) => {
  if (!text) return ''
  // Strip HTML tags using a temporary element or regex
  // Using regex for simplicity and performance in this context, 
  // though temporary element is safer for complex HTML structure decoding.
  // Given we just need a plain text preview:
  const strippedText = text.replace(/<[^>]*>?/gm, '')
  
  if (strippedText.length <= length) return strippedText
  return strippedText.substring(0, length) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

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

const handleLike = () => {
  if (!authStore.isAuthenticated) {
    alert('Bạn cần đăng nhập để thích bài viết')
    return
  }

  try {
    authStore.toggleLike(props.post.id)
  } catch (error) {
    alert(error.message)
  }
}

const handleDelete = () => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    emit('delete', props.post.id)
  }
}
</script>

<style scoped>
.post-card {
  border-radius: 8px;
}

.fs-7 { font-size: 0.875rem; }
.small-badge { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.ai-summary {
  background-color: #f8f9fa !important;
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
  color: #000000 !important;
}

.badge-hashtag {
  font-size: 0.95rem;
  color: #000000;
  cursor: pointer;
  margin-right: 4px;
  font-weight: 500;
}

.badge-hashtag:hover {
  text-decoration: underline;
}

.icon-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000 !important;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-ghost-dark {
  background: transparent;
  border: none;
  color: #65676b;
  transition: background 0.2s;
}

.btn-ghost-dark:hover {
  background-color: #f2f2f2;
}

.hover-underline:hover {
  text-decoration: underline !important;
}

.x-small {
  font-size: 0.75rem;
}

/* Images Grid Styles */
.grid-layout {
  display: grid;
  gap: 2px;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #f0f2f5;
}

.grid-layout.cols-1 { grid-template-columns: 1fr; aspect-ratio: auto; }
.grid-layout.cols-1 .grid-item img { max-height: 500px; width: 100%; object-fit: contain; }

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
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
