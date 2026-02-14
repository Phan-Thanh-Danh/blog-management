<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- Card thông tin cá nhân -->
        <div class="card shadow mb-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">
              <i class="bi bi-person-circle"></i> Thông tin cá nhân
            </h4>
          </div>
          <div class="card-body p-4">
            <!-- Hiển thị avatar -->
            <div class="text-center mb-4">
              <img 
                :src="form.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.name)" 
                class="rounded-circle border border-3 border-primary mb-3" 
                width="150" 
                height="150" 
                alt="Avatar"
                style="object-fit: cover;"
              >
              <h3 class="fw-bold">{{ form.name }}</h3>
              <p class="text-muted mb-0">
                <small>Thành viên từ {{ formatJoinDate(authStore.user.createdAt) }}</small>
              </p>
            </div>
            
            <!-- Thống kê Clickable -->
            <div class="d-flex justify-content-around text-center mb-4">
              <div class="stat-item cursor-pointer" @click="activeTab = 'posts'" :class="{ 'active': activeTab === 'posts' }">
                <h4 class="mb-0 fw-bold">{{ myPosts.length }}</h4>
                <small class="text-muted">Bài viết</small>
              </div>
              <div class="stat-item cursor-pointer" @click="activeTab = 'following'" :class="{ 'active': activeTab === 'following' }">
                <h4 class="mb-0 fw-bold">{{ followingCount }}</h4>
                <small class="text-muted">Đang theo dõi</small>
              </div>
              <div class="stat-item cursor-pointer" @click="activeTab = 'followers'" :class="{ 'active': activeTab === 'followers' }">
                <h4 class="mb-0 fw-bold">{{ followersCount }}</h4>
                <small class="text-muted">Người theo dõi</small>
              </div>
            </div>

            <hr>
            
            <!-- Form cập nhật thông tin (Toggle) -->
            <button class="btn btn-outline-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#editProfileForm">
              <i class="bi bi-pencil-square"></i> Chỉnh sửa thông tin
            </button>

            <div class="collapse" id="editProfileForm">
              <form @submit.prevent="handleUpdate" class="mt-3">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="bi bi-person"></i> Họ và tên <span class="text-danger">*</span>
                    </label>
                    <input 
                      v-model="form.name" 
                      type="text" 
                      class="form-control" 
                      required
                      placeholder="Nhập họ và tên"
                    >
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="bi bi-envelope"></i> Email <span class="text-danger">*</span>
                    </label>
                    <input 
                      v-model="form.email" 
                      type="email" 
                      class="form-control" 
                      required
                      placeholder="Nhập email"
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="bi bi-image"></i> Ảnh đại diện
                  </label>
                  <div class="input-group">
                    <input 
                      type="file" 
                      @change="handleAvatarUpload"
                      class="form-control"
                      accept="image/*"
                      id="avatarInput"
                    >
                    <button 
                      v-if="form.avatar && !form.avatar.includes('ui-avatars.com')" 
                      @click="removeAvatar"
                      class="btn btn-outline-danger" 
                      type="button"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Mật khẩu mới</label>
                    <input 
                      v-model="form.password" 
                      type="password" 
                      class="form-control"
                      minlength="6"
                      placeholder="Mật khẩu mới (tùy chọn)"
                    >
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Xác nhận mật khẩu</label>
                    <input 
                      v-model="form.confirmPassword" 
                      type="password" 
                      class="form-control"
                      placeholder="Nhập lại mật khẩu mới"
                    >
                  </div>
                </div>

                <!-- Thông báo -->
                <div v-if="error" class="alert alert-danger py-2 mb-3">{{ error }}</div>
                <div v-if="success" class="alert alert-success py-2 mb-3">{{ success }}</div>

                <button type="submit" class="btn btn-primary w-100">
                  <i class="bi bi-check-circle"></i> Lưu thay đổi
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Tabs Content -->
        <div class="card shadow">
          <div class="card-header bg-white border-bottom-0 pb-0">
            <ul class="nav nav-tabs card-header-tabs" role="tablist">
              <li class="nav-item">
                <button 
                  class="nav-link" 
                  :class="{ active: activeTab === 'posts' }"
                  @click="activeTab = 'posts'"
                >
                  <i class="bi bi-file-text"></i> Bài viết
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link" 
                  :class="{ active: activeTab === 'following' }"
                  @click="activeTab = 'following'"
                >
                  <i class="bi bi-person-check"></i> Đang theo dõi
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link" 
                  :class="{ active: activeTab === 'followers' }"
                  @click="activeTab = 'followers'"
                >
                  <i class="bi bi-people"></i> Người theo dõi
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body">
            <!-- Tab: Bài viết -->
            <div v-if="activeTab === 'posts'">
              <div v-if="myPosts.length === 0" class="text-center py-5">
                <p class="text-muted">Bạn chưa có bài viết nào</p>
                <router-link to="/create-post" class="btn btn-primary btn-sm">
                  Viết bài ngay
                </router-link>
              </div>
              <div v-else class="list-group list-group-flush">
                <div 
                  v-for="post in myPosts" 
                  :key="post.id"
                  class="list-group-item py-3 px-0 border-bottom"
                >
                  <div class="d-flex justify-content-between align-items-center">
                    <router-link :to="`/post/${post.id}`" class="flex-grow-1 text-decoration-none">
                      <h6 class="mb-1 text-dark">{{ post.title }}</h6>
                      <small class="text-muted">
                        {{ formatDate(post.createdAt) }} • {{ getCommentsCount(post.id) }} bình luận
                      </small>
                    </router-link>
                    <div class="ms-3">
                      <button 
                        @click.stop="handleDeletePost(post.id)" 
                        class="btn btn-outline-danger btn-sm"
                        title="Xóa bài viết"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Đang theo dõi -->
            <div v-if="activeTab === 'following'">
              <div v-if="followingList.length === 0" class="text-center py-5">
                <p class="text-muted">Bạn chưa theo dõi ai</p>
                <router-link to="/" class="btn btn-outline-primary btn-sm">
                  Khám phá bài viết
                </router-link>
              </div>
              <div v-else class="list-group list-group-flush">
                <div 
                  v-for="user in followingList" 
                  :key="user.id" 
                  class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between"
                >
                  <div class="d-flex align-items-center">
                    <img :src="user.avatar" class="rounded-circle me-3 border" width="48" height="48" alt="Avatar">
                    <div>
                      <h6 class="mb-0">{{ user.name }}</h6>
                      <small class="text-muted">Thành viên</small>
                    </div>
                  </div>
                  <button @click="authStore.toggleFollow(user.id)" class="btn btn-outline-secondary btn-sm">
                    Bỏ theo dõi
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab: Người theo dõi -->
            <div v-if="activeTab === 'followers'">
              <div v-if="followersList.length === 0" class="text-center py-5">
                <p class="text-muted">Chưa có ai theo dõi bạn</p>
              </div>
              <div v-else class="list-group list-group-flush">
                <div 
                  v-for="user in followersList" 
                  :key="user.id" 
                  class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between"
                >
                  <div class="d-flex align-items-center">
                    <img :src="user.avatar" class="rounded-circle me-3 border" width="48" height="48" alt="Avatar">
                    <div>
                      <h6 class="mb-0">{{ user.name }}</h6>
                      <small class="text-muted">Thành viên</small>
                    </div>
                  </div>
                  <button 
                    @click="authStore.toggleFollow(user.id)" 
                    class="btn btn-sm"
                    :class="authStore.isFollowing(user.id) ? 'btn-outline-secondary' : 'btn-primary'"
                  >
                    {{ authStore.isFollowing(user.id) ? 'Đang theo dõi' : 'Theo dõi lại' }}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { compressImage } from '../utils/imageHelper'

const authStore = useAuthStore()

// Form data
const form = ref({
  name: '',
  email: '',
  avatar: '',
  password: '',
  confirmPassword: ''
})

// State cho thông báo
const error = ref('')
const success = ref('')

// Tab state
const activeTab = ref('posts')

// Computed: Lấy bài viết của user hiện tại
const myPosts = computed(() => {
  return authStore.posts.filter(p => p.authorId === authStore.user?.id)
})

// Computed: Đếm số bình luận của user
const myCommentsCount = computed(() => {
  return authStore.comments.filter(c => c.authorId === authStore.user?.id).length
})

// Computed: Danh sách người đang theo dõi
const followingList = computed(() => {
  if (!authStore.user) return []
  return authStore.getFollowingUsers(authStore.user.id)
})

// Computed: Danh sách người theo dõi
const followersList = computed(() => {
  if (!authStore.user) return []
  return authStore.getFollowersUsers(authStore.user.id)
})

const followingCount = computed(() => followingList.value.length)
const followersCount = computed(() => followersList.value.length)

// Computed: Tính số ngày đã tham gia
const daysSinceJoined = computed(() => {
  if (!authStore.user?.createdAt) return 0
  const joinDate = new Date(authStore.user.createdAt)
  const today = new Date()
  const diffTime = Math.abs(today - joinDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Load dữ liệu user vào form khi component mount
onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name
    form.value.email = authStore.user.email
    form.value.avatar = authStore.user.avatar
  }
})

// Hàm format ngày tháng đầy đủ
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

// Hàm format ngày tham gia
const formatJoinDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Hàm cắt ngắn text
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Hàm đếm số bình luận của một bài viết
const getCommentsCount = (postId) => {
  return authStore.comments.filter(c => c.postId === postId).length
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const compressed = await compressImage(e.target.result, 300, 300, 0.7)
        form.value.avatar = compressed
      } catch (err) {
        console.error('Lỗi nén ảnh:', err)
        error.value = 'Không thể nén ảnh đại diện'
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeAvatar = () => {
  form.value.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.value.name)}`
  const fileInput = document.getElementById('avatarInput')
  if (fileInput) fileInput.value = ''
}

// Xử lý cập nhật thông tin
const handleUpdate = () => {
  error.value = ''
  success.value = ''

  // Kiểm tra mật khẩu nếu có nhập
  if (form.value.password) {
    if (form.value.password.length < 6) {
      error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
      return
    }
    
    if (form.value.password !== form.value.confirmPassword) {
      error.value = 'Mật khẩu xác nhận không khớp'
      return
    }
  }

  try {
    const updateData = {
      name: form.value.name,
      email: form.value.email,
      avatar: form.value.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.value.name)}`
    }

    // Chỉ thêm password nếu user muốn đổi
    if (form.value.password) {
      updateData.password = form.value.password
    }

    authStore.updateProfile(updateData)
    success.value = 'Cập nhật thông tin thành công!'
    
    // Reset password fields
    form.value.password = ''
    form.value.confirmPassword = ''

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      success.value = ''
    }, 3000)

// Xử lý xóa bài viết
const handleDeletePost = (postId) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    try {
      authStore.deletePost(postId)
      success.value = 'Xóa bài viết thành công!'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } catch (err) {
      error.value = err.message
    }
  }
}
</script>

<style scoped>
.list-group-item {
  transition: all 0.3s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* Animation cho avatar */
.rounded-circle {
  transition: transform 0.3s ease;
}

.rounded-circle:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem !important;
  }
  
  .rounded-circle {
    width: 120px !important;
    height: 120px !important;
  }
}
</style>