 <template>
  <div class="home-wrapper">
    <!-- Hero Section: Compact & Modern -->
    <div class="hero-section py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-7 text-white">
            <h1 class="display-5 fw-bold mb-3">
              Chào mừng đến MyBlog
            </h1>
            <p class="fs-5 opacity-75 mb-4">Chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị của bạn.</p>
            <div class="d-flex gap-2">
              <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn btn-light rounded-pill px-4 shadow-sm">
                Bắt đầu ngay
              </router-link>
              <router-link v-else to="/create-post" class="btn btn-light rounded-pill px-4 shadow-sm">
                Viết bài mới
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <div class="row justify-content-center">
        <!-- Posts Section -->
        <div class="col-lg-10 col-xl-8">
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div class="d-flex align-items-center gap-3">
              <h2 class="fw-bold mb-0">
                <i class="bi bi-newspaper"></i> Bài viết mới
              </h2>
              <div class="btn-group shadow-sm">
                <button 
                  @click="feedType = 'all'" 
                  class="btn btn-sm"
                  :class="feedType === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                >
                  Tất cả
                </button>
                <button 
                  v-if="authStore.isAuthenticated"
                  @click="feedType = 'following'" 
                  class="btn btn-sm"
                  :class="feedType === 'following' ? 'btn-primary' : 'btn-outline-primary'"
                >
                  Đang theo dõi
                </button>
              </div>
            </div>

            <div class="dropdown d-flex gap-2 ms-auto">
              <div v-if="searchFilter" class="d-flex align-items-center me-2">
                <span class="badge bg-primary text-white border me-2 py-2 px-3 rounded-pill">
                   # {{ searchFilter }}
                  <button @click="clearFilter" class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;"></button>
                </span>
              </div>
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle shadow-sm" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-funnel"></i> Sắp xếp
              </button>
              <ul class="dropdown-menu shadow">
                <li><a class="dropdown-item" @click="sortBy = 'newest'" href="#">Mới nhất</a></li>
                <li><a class="dropdown-item" @click="sortBy = 'oldest'" href="#">Cũ nhất</a></li>
                <li><a class="dropdown-item" @click="sortBy = 'mostLiked'" href="#">Nhiều like nhất</a></li>
              </ul>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="sortedPosts.length === 0" class="empty-state text-center py-5 shadow-sm border-0">
            <i class="bi bi-inbox" style="font-size: 5rem; color: #ddd;"></i>
            <h3 class="mt-4 text-muted">
              {{ feedType === 'following' ? 'Chưa có bài viết từ người bạn theo dõi' : 'Chưa có bài viết nào' }}
            </h3>
            <p v-if="feedType === 'following'" class="text-muted mb-4">
              Hãy theo dõi thêm nhiều tác giả để thấy bài viết của họ tại đây!
            </p>
            <p v-else class="text-muted mb-4">Hãy là người đầu tiên đăng bài!</p>
            
            <div v-if="feedType === 'following'">
              <button @click="feedType = 'all'" class="btn btn-outline-primary">
                Khám phá tất cả bài viết
              </button>
            </div>
            <router-link v-else-if="authStore.isAuthenticated" to="/create-post" class="btn btn-primary btn-lg rounded-pill">
              <i class="bi bi-plus-circle"></i> Viết bài đầu tiên
            </router-link>
          </div>

          <!-- Posts List -->
          <div v-else>
            <div class="row row-cols-1 g-4">
              <div v-for="post in sortedPosts" :key="post.id" class="col">
                <PostCard 
                  :post="post"
                  @edit="editPost"
                  @delete="deletePost"
                />
              </div>
            </div>

            <!-- Load More -->
            <div v-if="sortedPosts.length >= 10" class="text-center mt-5">
              <button class="btn btn-outline-primary rounded-pill px-5">
                Xem thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal chỉnh sửa bài viết -->
    <div class="modal fade" id="editModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil"></i> Chỉnh sửa bài viết
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePost">
              <div class="mb-3">
                <label class="form-label fw-bold">Tiêu đề</label>
                <input v-model="editForm.title" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Nội dung</label>
                <Editor v-model="editForm.content" :height="400" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Hình ảnh minh họa</label>
                <input 
                  type="file" 
                  @change="handleEditImageUpload"
                  class="form-control mb-2"
                  accept="image/*"
                >
                <div v-if="editForm.image" class="position-relative d-inline-block">
                  <img :src="editForm.image" class="img-fluid rounded" style="max-height: 200px;" alt="Preview">
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
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check-circle"></i> Cập nhật
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  <i class="bi bi-x-circle"></i> Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PostCard from '../components/PostCard.vue'
import Editor from '../components/Editor.vue'
import { Modal } from 'bootstrap'
import { compressImage } from '../utils/imageHelper'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sortBy = ref('newest')
const searchFilter = ref('')
const feedType = ref('all') // 'all' | 'following'

// Watch query search để cập nhật filter
watch(() => route.query.search, (newSearch) => {
  searchFilter.value = newSearch || ''
}, { immediate: true })

const editForm = ref({
  id: null,
  title: '',
  content: '',
  image: ''
})

let editModal = null

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
      // Ưu tiên khớp hashtag nếu query có dấu #
      const isTagMatch = post.tags && post.tags.some(t => t.toLowerCase() === originalQuery)
      
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

const filterByTag = (tag) => {
  router.push({ path: '/', query: { search: tag } })
}

const clearFilter = () => {
  router.push('/')
}

const editPost = (post) => {
  editForm.value = {
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image
  }
  
  if (!editModal) {
    const modalEl = document.getElementById('editModal')
    if (modalEl) editModal = new Modal(modalEl)
  }
  if (editModal) editModal.show()
}

const handleEditImageUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const compressed = await compressImage(e.target.result, 1024, 1024, 0.7)
        editForm.value.image = compressed
      } catch (err) {
        console.error('Lỗi nén ảnh:', err)
        alert('Không thể nén ảnh: ' + file.name)
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeEditImage = () => {
  editForm.value.image = ''
  // Try to clear input if currently in DOM
  const fileInput = document.querySelector('#editModal input[type="file"]')
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

const deletePost = (postId) => {
  try {
    authStore.deletePost(postId)
    alert('Xóa bài viết thành công!')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.home-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #2b3e50 0%, #4b6cb7 100%);
  color: white !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.hero-section h1 {
  color: white;
}

.hero-section p {
  color: rgba(255,255,255,0.8);
}

.card {
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.empty-state {
  background: white;
  border-radius: 20px;
  padding: 4rem;
}

.badge {
  font-weight: 500;
  transition: all 0.2s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-shadow:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

@media (max-width: 992px) {
  .hero-section {
    text-align: center;
    padding: 3rem 0;
  }
}
</style>