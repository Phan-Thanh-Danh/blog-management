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
              <p class="text-muted mb-0">
                <small>Thành viên từ {{ formatJoinDate(authStore.user.createdAt) }}</small>
              </p>
            </div>
            
            <!-- Form cập nhật thông tin -->
            <form @submit.prevent="handleUpdate">
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
                <small class="text-muted">
                  Chọn ảnh từ máy tính (tối đa 2MB). Để trống sẽ dùng avatar mặc định.
                </small>
              </div>

              <hr class="my-4">

              <h5 class="mb-3">
                <i class="bi bi-key"></i> Đổi mật khẩu (không bắt buộc)
              </h5>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Mật khẩu mới</label>
                  <input 
                    v-model="form.password" 
                    type="password" 
                    class="form-control"
                    minlength="6"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  >
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Xác nhận mật khẩu mới</label>
                  <input 
                    v-model="form.confirmPassword" 
                    type="password" 
                    class="form-control"
                    placeholder="Nhập lại mật khẩu mới"
                  >
                </div>
              </div>

              <small class="text-muted d-block mb-3">
                * Chỉ điền vào phần này nếu bạn muốn đổi mật khẩu
              </small>

              <!-- Thông báo lỗi -->
              <div v-if="error" class="alert alert-danger alert-dismissible fade show">
                <i class="bi bi-exclamation-triangle"></i> {{ error }}
                <button type="button" class="btn-close" @click="error = ''"></button>
              </div>

              <!-- Thông báo thành công -->
              <div v-if="success" class="alert alert-success alert-dismissible fade show">
                <i class="bi bi-check-circle"></i> {{ success }}
                <button type="button" class="btn-close" @click="success = ''"></button>
              </div>

              <!-- Nút hành động -->
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check-circle"></i> Cập nhật thông tin
                </button>
                <router-link to="/" class="btn btn-secondary">
                  <i class="bi bi-arrow-left"></i> Quay lại
                </router-link>
              </div>
            </form>
          </div>
        </div>

        <!-- Card bài viết của tôi -->
        <div class="card shadow">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-file-text"></i> Bài viết của tôi ({{ myPosts.length }})
              </h5>
              <router-link to="/create-post" class="btn btn-sm btn-primary">
                <i class="bi bi-plus-circle"></i> Viết bài mới
              </router-link>
            </div>
          </div>
          <div class="card-body">
            
            <!-- Thông báo chưa có bài viết -->
            <div v-if="myPosts.length === 0" class="text-center py-5">
              <i class="bi bi-file-earmark-text text-muted" style="font-size: 4rem;"></i>
              <p class="text-muted mt-3 mb-4">Bạn chưa có bài viết nào</p>
              <router-link to="/create-post" class="btn btn-primary">
                <i class="bi bi-plus-circle"></i> Viết bài viết đầu tiên
              </router-link>
            </div>

            <!-- Danh sách bài viết -->
            <div v-else class="list-group list-group-flush">
              <router-link 
                v-for="post in myPosts" 
                :key="post.id"
                :to="`/post/${post.id}`"
                class="list-group-item list-group-item-action py-3"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1 me-3">
                    <div class="d-flex align-items-center mb-2">
                      <img 
                        v-if="post.image" 
                        :src="post.image" 
                        class="rounded me-3" 
                        width="80" 
                        height="60" 
                        style="object-fit: cover;"
                        :alt="post.title"
                      >
                      <div>
                        <h6 class="mb-1">{{ post.title }}</h6>
                        <small class="text-muted">
                          <i class="bi bi-clock"></i> {{ formatDate(post.createdAt) }}
                        </small>
                        <br>
                        <small class="text-muted">
                          <i class="bi bi-chat-dots"></i> {{ getCommentsCount(post.id) }} bình luận
                        </small>
                      </div>
                    </div>
                    <p class="mb-0 text-muted small">
                      {{ truncateText(post.content, 100) }}
                    </p>
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Card thống kê -->
        <div class="row mt-4">
          <div class="col-md-4 mb-3">
            <div class="card text-center shadow-sm">
              <div class="card-body">
                <i class="bi bi-file-text text-primary" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0">{{ myPosts.length }}</h3>
                <p class="text-muted mb-0">Bài viết</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card text-center shadow-sm">
              <div class="card-body">
                <i class="bi bi-chat-dots text-success" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0">{{ myCommentsCount }}</h3>
                <p class="text-muted mb-0">Bình luận</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card text-center shadow-sm">
              <div class="card-body">
                <i class="bi bi-calendar-check text-info" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0">{{ daysSinceJoined }}</h3>
                <p class="text-muted mb-0">Ngày tham gia</p>
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

// Computed: Lấy bài viết của user hiện tại
const myPosts = computed(() => {
  return authStore.posts.filter(p => p.authorId === authStore.user?.id)
})

// Computed: Đếm số bình luận của user
const myCommentsCount = computed(() => {
  return authStore.comments.filter(c => c.authorId === authStore.user?.id).length
})

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
    if (file.size > 2 * 1024 * 1024) { // Limit 2MB
      error.value = 'Kích thước ảnh quá lớn (tối đa 2MB)'
      event.target.value = '' // Reset input
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.avatar = e.target.result
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

    // Scroll to top để user thấy thông báo
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = err.message
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