 <template>
  <div class="home-page min-vh-100 bg-light pt-4">
    <div class="container px-lg-4">
      <div class="row g-4">
        <!-- 1. Left Sidebar: Navigation & Shortcuts -->
        <div class="col-lg-3 d-none d-lg-block sticky-column">
          <div class="nav-sidebar pe-2">
            <!-- Profile Shortcut -->
            <router-link v-if="authStore.isAuthenticated" :to="`/profile`" class="nav-item-link mb-1">
              <img :src="authStore.user?.avatar" class="rounded-circle border border-dark me-3" width="36" height="36" style="object-fit: cover;">
              <span class="fw-bold">{{ authStore.user?.name }}</span>
            </router-link>

            <router-link 
              to="/" 
              @click="resetHome"
              class="nav-item-link mb-1" 
              :class="{ active: !searchFilter && feedType === 'all' }"
            >
              <i class="bi bi-house-door-fill fs-5 me-3 text-black"></i>
              <span class="fw-semibold">Trang chủ</span>
            </router-link>

            <a 
              v-if="authStore.isAuthenticated" 
              @click.prevent="feedType = 'following'" 
              href="#" 
              class="nav-item-link mb-1" 
              :class="{ active: feedType === 'following' }"
            >
              <i class="bi bi-people-fill fs-5 me-3 text-black"></i>
              <span class="fw-semibold">Đang theo dõi</span>
            </a>

            <hr class="my-2 px-3 border-dark">

            <h6 class="text-black fw-bold px-3 mb-2 small text-uppercase">Danh mục</h6>
            <div class="categories-list">
               <a 
                 v-for="cat in authStore.categories" 
                 :key="cat" 
                 href="#" 
                 class="nav-item-link mb-1"
                 :class="{ active: searchFilter === cat }"
                 @click.prevent="searchFilter = cat"
               >
                 <i class="bi bi-hash fs-5 me-3 text-black"></i>
                 <span>{{ cat }}</span>
               </a>
            </div>
          </div>
        </div>

        <!-- 2. Center Column: Composer & Feed -->
        <div class="col-lg-6">
          <div class="feed-container mx-auto" style="max-width: 600px;">
            <!-- Post Composer (Facebook Style) -->
            <div v-if="authStore.isAuthenticated" class="card shadow-none border border-dark mb-4 p-3 composer-card rounded-3">
              <div class="d-flex align-items-center gap-2">
                <img :src="authStore.user?.avatar" class="rounded-circle border border-dark" width="40" height="40" style="object-fit: cover;">
                <button @click="openCreateModal" class="flex-grow-1 btn btn-light rounded-pill px-4 py-2 text-muted text-start border border-dark shadow-none hover-bg-gray bg-white">
                  {{ authStore.user?.name }} ơi, bạn đang nghĩ gì thế?
                </button>
              </div>
              <hr class="my-3 border-dark">
              <div class="d-flex justify-content-around">
                <button @click="openCreateModal" class="btn btn-ghost-dark flex-grow-1 py-2 text-black fw-bold">
                  <i class="bi bi-camera-video-fill me-2"></i> Trực tiếp
                </button>
                <button @click="openCreateModal" class="btn btn-ghost-dark flex-grow-1 py-2 text-black fw-bold">
                  <i class="bi bi-images me-2"></i> Ảnh/video
                </button>
                <button @click="openCreateModal" class="btn btn-ghost-dark flex-grow-1 py-2 d-none d-sm-block text-black fw-bold">
                  <i class="bi bi-emoji-smile me-2"></i> Cảm xúc
                </button>
              </div>
            </div>

            <!-- Feed Filters/Sort -->
            <div class="d-flex justify-content-between align-items-center mb-3">
               <h5 class="fw-bold mb-0">Bài viết</h5>
               <div class="dropdown">
                  <button class="btn btn-white border border-dark btn-sm fw-bold dropdown-toggle shadow-none rounded-pill px-3" data-bs-toggle="dropdown">
                    Lọc: {{ sortBy === 'newest' ? 'Mới nhất' : sortBy === 'oldest' ? 'Cũ nhất' : 'Phổ biến' }}
                  </button>
                  <ul class="dropdown-menu shadow-sm border border-dark rounded-0">
                    <li><a class="dropdown-item" @click.prevent="sortBy = 'newest'" href="#">Mới nhất</a></li>
                    <li><a class="dropdown-item" @click.prevent="sortBy = 'oldest'" href="#">Cũ nhất</a></li>
                    <li><a class="dropdown-item" @click.prevent="sortBy = 'mostLiked'" href="#">Phổ biến nhất</a></li>
                  </ul>
               </div>
            </div>

            <!-- Active Filter Badge -->
            <div v-if="searchFilter" class="mb-3 px-1">
               <div class="badge bg-black text-white border border-dark rounded-pill py-2 px-3 d-inline-flex align-items-center shadow-sm">
                  # {{ searchFilter }}
                  <i class="bi bi-x-lg ms-2 cursor-pointer" @click="clearFilter" style="font-size: 10px;"></i>
               </div>
            </div>

            <!-- Empty State -->
            <div v-if="sortedPosts.length === 0" class="empty-state text-center py-5 border border-dark bg-white rounded-3 mb-4">
              <i class="bi bi-inbox display-1 text-black opacity-25"></i>
              <h4 class="mt-4 fw-bold">Chưa có bài viết nào</h4>
              <p class="text-dark mb-4 opacity-75">
                {{ feedType === 'following' ? 'Theo dõi ai đó để xem bài viết của họ!' : 'Hãy là người đầu tiên chia sẻ câu chuyện của mình.' }}
              </p>
              <button v-if="feedType === 'following'" @click="feedType = 'all'" class="btn btn-black rounded-pill px-4">Khám phá ngay</button>
              <button v-else-if="authStore.isAuthenticated" @click="openCreateModal" class="btn btn-black rounded-pill px-4">Đăng bài ngay</button>
            </div>

            <!-- Posts List -->
            <div v-else class="posts-list">
              <div v-for="post in sortedPosts" :key="post.id">
                <PostCard 
                  :post="post"
                  @edit="editPost"
                  @delete="deletePost"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Right Sidebar: Suggested People -->
        <div class="col-lg-3 d-none d-lg-block sticky-column">
          <div class="widgets-sidebar border-start ps-3">
             <div class="card shadow-none border-0 bg-transparent">
                <div class="d-flex justify-content-between align-items-center mb-3 px-2">
                  <h6 class="text-muted fw-bold mb-0 text-uppercase small ls-1">Gợi ý theo dõi</h6>
                </div>
                <div class="list-group list-group-flush rounded-3 overflow-hidden bg-white border border-dark">
                   <div v-for="user in suggestedUsers" :key="user.id" class="list-group-item border-0 py-3">
                     <div class="d-flex align-items-center">
                        <img :src="user.avatar" class="rounded-circle border me-3" width="40" height="40" style="object-fit: cover;">
                        <div class="flex-grow-1 overflow-hidden">
                          <router-link :to="`/profile/${user.id}`" class="d-block fw-bold text-dark text-decoration-none text-truncate mb-0 small">{{ user.name }}</router-link>
                          <div class="x-small text-muted">Gợi ý cho bạn</div>
                        </div>
                     </div>
                     <button @click="authStore.toggleFollow(user.id)" class="btn btn-primary btn-sm w-100 mt-2 fw-semibold rounded-2">
                       Theo dõi
                     </button>
                   </div>
                   <div v-if="suggestedUsers.length === 0" class="list-group-item py-4 text-center text-muted small">
                     Bạn đã theo dõi hết rồi!
                   </div>
                </div>
             </div>
             
             <!-- Simple Footer -->
             <div class="mt-4 px-2 text-muted x-small">
               <div class="d-flex flex-wrap gap-1">
                 <span>Quyền riêng tư</span> • <span>Điều khoản</span> • <span>Dịch vụ</span> • <span>MyBlog © 2024</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Modal (Create/Edit) -->
    <PostModal 
      ref="postModalRef"
      :mode="modalMode"
      :initial-data="selectedPost"
      @saved="handlePostSaved"
    />
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PostCard from '../components/PostCard.vue'
import PostModal from '../components/PostModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sortBy = ref('newest')
const searchFilter = ref('')
const feedType = ref('all') // 'all' | 'following'

// Modal state
const postModalRef = ref(null)
const modalMode = ref('create')
const selectedPost = ref({})

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedPost.value = {}
  postModalRef.value?.show()
}

const handlePostSaved = () => {
  // PostCard or Store usually handles refreshing if needed
}

// Watch query search để cập nhật filter
watch(() => route.query.search, (newSearch) => {
  searchFilter.value = newSearch || ''
  // Nếu có tìm kiếm, đảm bảo feedType là 'all' để thấy kết quả rộng hơn
  if (newSearch) feedType.value = 'all'
}, { immediate: true })

// Watch for route change to reset filters when clicking "Trang chủ"
watch(() => route.path, (newPath) => {
  if (newPath === '/' && Object.keys(route.query).length === 0) {
    feedType.value = 'all'
    searchFilter.value = ''
  }
})

// Watch for global create action from Navbar
watch(() => route.query.action, (action) => {
  if (action === 'create' && authStore.isAuthenticated) {
    openCreateModal()
    // Clear query after opening to prevent re-opening on refresh if not intended
    // Actually, maybe keep it. But let's clean it up for better UX.
    router.replace({ path: '/', query: { ...route.query, action: undefined } })
  }
}, { immediate: true })


const resetHome = () => {
  feedType.value = 'all'
  searchFilter.value = ''
  if (Object.keys(route.query).length > 0) {
    router.push('/')
  }
}

// Computed: Sắp xếp và Lọc posts
const sortedPosts = computed(() => {
  let posts = [...authStore.posts]

  // Lọc theo Feed Type (Following)
  if (feedType.value === 'following') {
    if (!authStore.isAuthenticated) {
      feedType.value = 'all' // Reset nếu chưa đăng nhập
    } else {
      posts = posts.filter(post => authStore.isFollowing(post.authorId))
    }
  }
  
  // Lọc theo tìm kiếm hoặc danh mục
  if (searchFilter.value) {
    const originalQuery = searchFilter.value.toLowerCase()
    const queryWithoutHash = originalQuery.replace('#', '')
    
    posts = posts.filter(post => {
      // Ưu tiên khớp hashtag (tag trong store ko còn dấu #)
      const isTagMatch = post.tags && post.tags.some(t => {
        const tagLower = t.toLowerCase()
        return tagLower === originalQuery || tagLower === queryWithoutHash
      })
      
      const isCategoryMatch = post.category && post.category.toLowerCase() === queryWithoutHash
      const isTitleMatch = post.title.toLowerCase().includes(queryWithoutHash)
      const isContentMatch = post.content.toLowerCase().includes(queryWithoutHash)
      
      return isTagMatch || isCategoryMatch || isTitleMatch || isContentMatch
    })
  }

  // Sắp xếp
  if (sortBy.value === 'newest') {
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy.value === 'oldest') {
    posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (sortBy.value === 'mostLiked') {
    posts.sort((a, b) => 
      authStore.getPostLikesCount(b.id) - authStore.getPostLikesCount(a.id)
    )
  }
  
  return posts
})

// Computed: Gợi ý 3 người dùng khác mà chưa follow
const suggestedUsers = computed(() => {
  if (!authStore.user) return authStore.users.slice(0, 3)
  return authStore.users
    .filter(u => u.id !== authStore.user.id && !authStore.isFollowing(u.id))
    .slice(0, 3)
})

const filterByTag = (tag) => {
  router.push({ path: '/', query: { search: tag } })
}

const clearFilter = () => {
  router.push('/')
}

const editPost = (post) => {
  modalMode.value = 'edit'
  selectedPost.value = post
  postModalRef.value?.show()
}

const deletePost = (postId) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    try {
      authStore.deletePost(postId)
      alert('Xóa bài viết thành công!')
    } catch (error) {
      alert(error.message)
    }
  }
}
</script>

<style scoped>
.home-page {
  background-color: #f0f2f5;
  color: #1c1e21;
}

.sticky-column {
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.sticky-column::-webkit-scrollbar {
  width: 4px;
}
.sticky-column::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
}
.sticky-column:hover::-webkit-scrollbar-thumb {
  background: #bcc0c4;
}

/* Sidebar Links */
.nav-item-link {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  color: #1c1e21;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
}

.nav-item-link:hover {
  background: #e4e6e9;
}

.nav-item-link.active {
  background: rgba(8, 102, 255, 0.1);
  color: #0866ff;
}

/* Post Composer */
.composer-card {
  border-radius: 12px;
}

.hover-bg-gray:hover {
  background-color: #e4e6e9 !important;
}

.btn-ghost-dark {
  background: transparent;
  border: none;
  color: #65676b;
  font-weight: 600;
  border-radius: 8px;
  transition: background 0.2s;
}

.btn-ghost-dark:hover {
  background: #f2f2f2;
}

/* Widgets */
.ls-1 { letter-spacing: 0.5px; }
.x-small { font-size: 0.75rem; }

@media (max-width: 991px) {
  .home-page {
    padding-top: 1rem !important;
  }
}
</style>
