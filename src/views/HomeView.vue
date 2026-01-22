<template>
  <div class="home-wrapper">
    <!-- Hero Section -->
    <div class="hero-section bg-gradient text-dark py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-4 fw-bold mb-3">
              <i class="bi bi-journals"></i> Chào mừng đến MyBlog
            </h1>
            <p class="lead mb-4">Nơi chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị của bạn</p>
            <div v-if="!authStore.isAuthenticated" class="d-flex gap-3">
              <router-link to="/register" class="btn btn-light btn-lg">
                <i class="bi bi-person-plus"></i> Đăng ký ngay
              </router-link>
              <router-link to="/login" class="btn btn-outline-light btn-lg">
                <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
              </router-link>
            </div>
            <router-link v-else to="/create-post" class="btn btn-light btn-lg">
              <i class="bi bi-plus-circle"></i> Viết bài mới
            </router-link>
          </div>
          <div class="col-lg-4 text-center d-none d-lg-block">
            <i class="bi bi-pen-fill" style="font-size: 8rem; opacity: 0.3;"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <div class="row">
        <!-- Posts Section -->
        <div class="col-lg-8">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold mb-0">
              <i class="bi bi-newspaper"></i> Bài viết mới nhất
            </h2>
            <div class="dropdown">
              <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-funnel"></i> Sắp xếp
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="sortBy = 'newest'" href="#">Mới nhất</a></li>
                <li><a class="dropdown-item" @click="sortBy = 'oldest'" href="#">Cũ nhất</a></li>
                <li><a class="dropdown-item" @click="sortBy = 'mostLiked'" href="#">Nhiều like nhất</a></li>
              </ul>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="sortedPosts.length === 0" class="empty-state text-center py-5">
            <i class="bi bi-inbox" style="font-size: 5rem; color: #ddd;"></i>
            <h3 class="mt-4 text-muted">Chưa có bài viết nào</h3>
            <p class="text-muted mb-4">Hãy là người đầu tiên đăng bài!</p>
            <router-link v-if="authStore.isAuthenticated" to="/create-post" class="btn btn-primary btn-lg">
              <i class="bi bi-plus-circle"></i> Viết bài đầu tiên
            </router-link>
          </div>

          <!-- Posts List -->
          <div v-else>
            <PostCard 
              v-for="post in sortedPosts" 
              :key="post.id" 
              :post="post"
              @edit="editPost"
              @delete="deletePost"
            />

            <!-- Load More (nếu có nhiều bài) -->
            <div v-if="sortedPosts.length >= 10" class="text-center mt-4">
              <button class="btn btn-outline-primary">
                <i class="bi bi-arrow-down-circle"></i> Xem thêm
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="sidebar-sticky">
            <!-- User Info Card (nếu đã đăng nhập) -->
            <div v-if="authStore.isAuthenticated" class="card shadow-sm mb-4">
              <div class="card-body text-center">
                <img 
                  :src="authStore.user.avatar" 
                  class="rounded-circle mb-3 border border-3 border-primary" 
                  width="80" 
                  height="80" 
                  :alt="authStore.user.name"
                >
                <h5 class="mb-1">{{ authStore.user.name }}</h5>
                <p class="text-muted small mb-3">{{ authStore.user.email }}</p>
                <div class="d-grid gap-2">
                  <router-link to="/create-post" class="btn btn-primary">
                    <i class="bi bi-plus-circle"></i> Viết bài mới
                  </router-link>
                  <router-link to="/profile" class="btn btn-outline-primary">
                    <i class="bi bi-person"></i> Trang cá nhân
                  </router-link>
                </div>
              </div>
            </div>

            <!-- About Card -->
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h5 class="card-title fw-bold">
                  <i class="bi bi-info-circle"></i> Về MyBlog
                </h5>
                <p class="card-text text-muted">
                  MyBlog là nơi bạn có thể chia sẻ kiến thức, kinh nghiệm và kết nối với cộng đồng.
                </p>
                
                <div v-if="!authStore.isAuthenticated" class="d-grid gap-2">
                  <router-link to="/register" class="btn btn-primary">
                    <i class="bi bi-person-plus"></i> Đăng ký ngay
                  </router-link>
                  <router-link to="/login" class="btn btn-outline-primary">
                    <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Stats Card -->
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h5 class="card-title fw-bold mb-3">
                  <i class="bi bi-bar-chart"></i> Thống kê
                </h5>
                <div class="stats-list">
                  <div class="stat-item d-flex justify-content-between mb-3">
                    <span class="text-muted">
                      <i class="bi bi-file-text text-primary"></i> Tổng bài viết
                    </span>
                    <strong>{{ authStore.posts.length }}</strong>
                  </div>
                  <div class="stat-item d-flex justify-content-between mb-3">
                    <span class="text-muted">
                      <i class="bi bi-chat-dots text-success"></i> Tổng bình luận
                    </span>
                    <strong>{{ authStore.comments.length }}</strong>
                  </div>
                  <div class="stat-item d-flex justify-content-between mb-3">
                    <span class="text-muted">
                      <i class="bi bi-heart text-danger"></i> Tổng lượt thích
                    </span>
                    <strong>{{ authStore.likes.length }}</strong>
                  </div>
                  <div class="stat-item d-flex justify-content-between">
                    <span class="text-muted">
                      <i class="bi bi-people text-info"></i> Thành viên
                    </span>
                    <strong>{{ authStore.users.length }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Popular Tags -->
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title fw-bold mb-3">
                  <i class="bi bi-tags"></i> Xu hướng
                </h5>
                <div class="d-flex flex-wrap gap-2">
                  <span class="badge bg-primary">#VueJS</span>
                  <span class="badge bg-success">#JavaScript</span>
                  <span class="badge bg-danger">#WebDev</span>
                  <span class="badge bg-warning text-dark">#Frontend</span>
                  <span class="badge bg-info">#Coding</span>
                  <span class="badge bg-secondary">#Tech</span>
                </div>
              </div>
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
                <textarea v-model="editForm.content" class="form-control" rows="8" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Hình ảnh (URL)</label>
                <input v-model="editForm.image" type="url" class="form-control" placeholder="https://example.com/image.jpg">
              </div>
              <div v-if="editForm.image" class="mb-3">
                <img :src="editForm.image" class="img-fluid rounded" style="max-height: 200px;" alt="Preview">
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import PostCard from '../components/PostCard.vue'
import { Modal } from 'bootstrap'

const authStore = useAuthStore()

const sortBy = ref('newest')

const editForm = ref({
  id: null,
  title: '',
  content: '',
  image: ''
})

let editModal = null

// Computed: Sắp xếp posts
const sortedPosts = computed(() => {
  const posts = [...authStore.posts]
  
  if (sortBy.value === 'newest') {
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy.value === 'oldest') {
    return posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (sortBy.value === 'mostLiked') {
    return posts.sort((a, b) => 
      authStore.getPostLikesCount(b.id) - authStore.getPostLikesCount(a.id)
    )
  }
  
  return posts
})

const editPost = (post) => {
  editForm.value = {
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image
  }
  
  if (!editModal) {
    editModal = new Modal(document.getElementById('editModal'))
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sidebar-sticky {
  position: sticky;
  top: 90px;
}

.card {
  border: none;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.stats-list .stat-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.stats-list .stat-item:last-child {
  border-bottom: none;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 3rem;
}

.badge {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.badge:hover {
  transform: scale(1.1);
}

@media (max-width: 992px) {
  .sidebar-sticky {
    position: relative;
    top: 0;
    margin-top: 2rem;
  }
}
</style>