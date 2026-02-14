<template>
  <div class="profile-page bg-light min-vh-100">
    <!-- Header: Cover & Avatar -->
    <div class="profile-header bg-white shadow-sm mb-4">
      <div class="cover-container position-relative">
        <img 
          :src="authStore.user.coverPhoto || 'https://images.unsplash.com/photo-1549247793-5d0f529d1a12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'" 
          class="cover-photo" 
          alt="Cover"
        >
        <button v-if="isMyProfile" class="btn btn-light btn-sm position-absolute bottom-0 end-0 m-3 shadow-sm border" @click="triggerCoverUpload">
          <i class="bi bi-camera-fill me-1"></i> Chỉnh sửa ảnh bìa
        </button>
        <input type="file" ref="coverInput" class="d-none" @change="handleCoverUpload" accept="image/*">
      </div>

      <div class="container pb-3">
        <div class="header-content d-flex align-items-end px-4">
          <div class="avatar-wrapper position-relative">
            <img 
              :src="authStore.user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authStore.user.name)" 
              class="profile-avatar border border-4 border-white shadow" 
              alt="Avatar"
            >
            <button v-if="isMyProfile" class="btn btn-light rounded-circle shadow-sm border avatar-edit-btn" @click="triggerAvatarUpload">
              <i class="bi bi-camera-fill"></i>
            </button>
            <input type="file" ref="avatarInput" class="d-none" @change="handleAvatarUpload" accept="image/*">
          </div>
          
          <div class="header-info ms-4 mb-3 flex-grow-1">
            <h1 class="display-6 fw-bold mb-1">{{ authStore.user.name }}</h1>
            <p class="text-muted mb-0 fw-semibold">{{ friendsCount }} người bạn • {{ myPosts.length }} bài viết</p>
          </div>

          <div class="header-actions mb-3 d-flex gap-2">
            <button v-if="isMyProfile" class="btn btn-primary px-4 fw-semibold" @click="activeTab = 'edit'">
              <i class="bi bi-pencil-fill me-1"></i> Chỉnh sửa trang cá nhân
            </button>
            <div v-else class="d-flex gap-2">
              <button class="btn btn-primary px-4 fw-semibold">
                <i class="bi bi-person-plus-fill me-1"></i> Thêm bạn bè
              </button>
              <button class="btn btn-light px-4 fw-semibold border shadow-sm">
                <i class="bi bi-messenger me-1"></i> Nhắn tin
              </button>
            </div>
          </div>
        </div>
        
        <hr class="mx-4 my-2">
        
        <!-- Sub-nav Tabs -->
        <div class="px-4">
          <ul class="nav nav-pills profile-nav gap-2">
            <li class="nav-item">
              <button class="nav-link py-3 fw-semibold" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">Bài viết</button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-3 fw-semibold" :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">Giới thiệu</button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-3 fw-semibold" :class="{ active: activeTab === 'following' }" @click="activeTab = 'following'">Đang theo dõi</button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-3 fw-semibold" :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'">Người theo dõi</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="container pb-5">
      <div class="row g-4">
        <!-- Main Feed (Right Column in Facebook, but let's follow standard FB desktop: Intro on left, Feed on center/right) -->
        
        <!-- Left Column: Intro & Details -->
        <div class="col-lg-5 col-xl-4 order-2 order-lg-1">
          <!-- Intro Card -->
          <div class="card shadow-sm border-0 mb-3">
            <div class="card-body">
              <h5 class="fw-bold mb-3">Giới thiệu</h5>
              
              <div v-if="authStore.user.bio" class="text-center mb-4">
                <p class="mb-2">{{ authStore.user.bio }}</p>
                <button v-if="isMyProfile" class="btn btn-light w-100 fw-semibold border" @click="activeTab = 'edit'">Chỉnh sửa tiểu sử</button>
              </div>
              <div v-else-if="isMyProfile" class="text-center mb-4">
                <button class="btn btn-light w-100 fw-semibold border" @click="activeTab = 'edit'">Thêm tiểu sử</button>
              </div>

              <div class="intro-details d-flex flex-column gap-3">
                <div v-if="authStore.user.relationship" class="d-flex align-items-center text-muted">
                  <i class="bi bi-heart-fill me-3 fs-5"></i>
                  <span>{{ authStore.user.relationship }}</span>
                </div>
                <div v-if="authStore.user.birthday" class="d-flex align-items-center text-muted">
                  <i class="bi bi-cake2-fill me-3 fs-5"></i>
                  <span>Sinh nhật: {{ formatJoinDate(authStore.user.birthday) }}</span>
                </div>
                <div class="d-flex align-items-center text-muted">
                  <i class="bi bi-clock-fill me-3 fs-5"></i>
                  <span>Tham gia từ {{ formatJoinDate(authStore.user.createdAt) }}</span>
                </div>
                <div v-if="authStore.user.links && authStore.user.links.length > 0" class="d-flex flex-column gap-2 mt-1">
                  <div v-for="(link, i) in authStore.user.links" :key="i" class="d-flex align-items-center text-primary">
                    <i class="bi bi-link-45deg me-3 fs-5 text-muted"></i>
                    <a :href="link" target="_blank" class="text-decoration-none">{{ link }}</a>
                  </div>
                </div>
              </div>

              <button v-if="isMyProfile" class="btn btn-light w-100 mt-4 fw-semibold border" @click="activeTab = 'edit'">
                Chỉnh sửa chi tiết
              </button>
            </div>
          </div>

          <!-- Photos Card -->
          <div class="card shadow-sm border-0 mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Ảnh</h5>
                <a href="#" class="text-primary text-decoration-none small fw-semibold">Xem tất cả</a>
              </div>
              <div class="photo-grid d-grid gap-1 rounded overflow-hidden" style="grid-template-columns: repeat(3, 1fr);">
                <div v-for="(img, i) in recentPhotos" :key="i" class="photo-item aspect-square">
                  <img :src="img" class="w-100 h-100 object-fit-cover cursor-pointer">
                </div>
                <div v-if="recentPhotos.length === 0" class="text-center py-4 text-muted small col-span-3">
                  Chưa có ảnh nào
                </div>
              </div>
            </div>
          </div>

          <!-- Followers Summary Card -->
          <div class="card shadow-sm border-0 mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Bạn bè / Người theo dõi</h5>
                <a href="#" @click.prevent="activeTab = 'followers'" class="text-primary text-decoration-none small fw-semibold">Xem tất cả</a>
              </div>
              <p class="text-muted small mb-3">{{ followersCount }} người theo dõi</p>
              <div class="friends-grid d-grid gap-3" style="grid-template-columns: repeat(3, 1fr);">
                <div v-for="user in followersList.slice(0, 6)" :key="user.id" class="text-center">
                  <img :src="user.avatar" class="w-100 rounded border mb-1 aspect-square object-fit-cover">
                  <small class="d-block fw-semibold text-truncate">{{ user.name }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Column: Feed -->
        <div class="col-lg-7 col-xl-8 order-1 order-lg-2">
          <!-- Post Composer (Placeholder-ish or actual) -->
          <div v-if="isMyProfile" class="card shadow-sm border-0 mb-4 p-3">
            <div class="d-flex align-items-center gap-3">
              <img :src="authStore.user.avatar" class="rounded-circle border" width="40" height="40">
              <router-link to="/create-post" class="flex-grow-1 bg-light rounded-pill px-4 py-2 text-muted text-decoration-none hover-bg-gray">
                {{ authStore.user.name }} ơi, bạn đang nghĩ gì thế?
              </router-link>
            </div>            
          </div>

          <!-- Tab Contents -->
          <div v-if="activeTab === 'posts'">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Bài viết</h5>
                <div class="d-flex gap-2">
                    <button class="btn btn-light btn-sm border fw-semibold"><i class="bi bi-filter me-1"></i>Bộ lọc</button>
                    <button class="btn btn-light btn-sm border fw-semibold"><i class="bi bi-gear-fill me-1"></i>Quản lý bài viết</button>
                </div>
            </div>

            <div v-if="myPosts.length === 0" class="card shadow-sm border-0 p-5 text-center">
                <i class="bi bi-file-earmark-text display-4 text-muted mb-3"></i>
                <h5>Bạn chưa có bài viết nào</h5>
                <p class="text-muted">Chia sẻ những câu chuyện của bạn ngay bây giờ!</p>
                <router-link to="/create-post" class="btn btn-primary px-4">Viết bài ngay</router-link>
            </div>
            <div v-else>
                <PostCard 
                  v-for="post in myPosts" 
                  :key="post.id" 
                  :post="post"
                  @delete="handleDeletePost"
                />
            </div>
          </div>

          <!-- Other Tabs (Simplified for now or full implementation) -->
          <div v-if="activeTab === 'edit'" class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4">Chỉnh sửa trang cá nhân</h5>
              <form @submit.prevent="handleUpdate">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Tên hiển thị</label>
                    <input v-model="form.name" type="text" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Email</label>
                    <input v-model="form.email" type="email" class="form-control" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Tiểu sử (Bio)</label>
                    <textarea v-model="form.bio" class="form-control" rows="3" placeholder="Giới thiệu ngắn về bản thân..."></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Ngày sinh</label>
                    <input v-model="form.birthday" type="date" class="form-control">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Tình trạng mối quan hệ</label>
                    <select v-model="form.relationship" class="form-select">
                      <option value="">Không hiển thị</option>
                      <option value="Độc thân">Độc thân</option>
                      <option value="Đang hẹn hò">Đang hẹn hò</option>
                      <option value="Đã kết hôn">Đã kết hôn</option>
                      <option value="Phức tạp">Phức tạp</option>
                    </select>
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
                <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>

                <div class="d-flex gap-2 mt-4">
                  <button type="submit" class="btn btn-primary px-4 fw-semibold">Lưu thay đổi</button>
                  <button type="button" class="btn btn-light px-4 border" @click="activeTab = 'posts'">Hủy</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Followers / Following (Simple list) -->
          <div v-if="activeTab === 'followers' || activeTab === 'following'" class="card shadow-sm border-0">
            <div class="card-body">
               <h5 class="fw-bold mb-4">{{ activeTab === 'followers' ? 'Người theo dõi' : 'Đang theo dõi' }}</h5>
               <div class="list-group list-group-flush">
                 <div v-for="user in (activeTab === 'followers' ? followersList : followingList)" :key="user.id" class="list-group-item d-flex align-items-center justify-content-between px-0">
                   <div class="d-flex align-items-center">
                     <img :src="user.avatar" class="rounded border me-3" width="60" height="60" style="object-fit: cover;">
                     <h6 class="mb-0 fw-bold">{{ user.name }}</h6>
                   </div>
                   <button @click="authStore.toggleFollow(user.id)" class="btn btn-light border btn-sm fw-semibold">
                     {{ authStore.isFollowing(user.id) ? 'Bỏ theo dõi' : 'Theo dõi lại' }}
                   </button>
                 </div>
                 <div v-if="(activeTab === 'followers' ? followersList : followingList).length === 0" class="text-center py-5 text-muted">
                    Trống
                 </div>
               </div>
            </div>
          </div>

          <!-- About tab -->
          <div v-if="activeTab === 'about'" class="card shadow-sm border-0">
            <div class="card-body p-4">
                <h5 class="fw-bold mb-4">Giới thiệu về {{ authStore.user.name }}</h5>
                <div class="list-group list-group-flush intro-details">
                    <div class="list-group-item px-0 py-3 d-flex align-items-center">
                        <i class="bi bi-clock-fill me-4 fs-4 text-muted"></i>
                        <div>
                            <p class="mb-0 fw-semibold">Đã tham gia vào {{ formatJoinDate(authStore.user.createdAt) }}</p>
                            <small class="text-muted">Ngày gia nhập trang web</small>
                        </div>
                    </div>
                    <div v-if="authStore.user.birthday" class="list-group-item px-0 py-3 d-flex align-items-center">
                        <i class="bi bi-cake2-fill me-4 fs-4 text-muted"></i>
                        <div>
                            <p class="mb-0 fw-semibold">Sinh ngày {{ formatJoinDate(authStore.user.birthday) }}</p>
                            <small class="text-muted">Ngày sinh nhật</small>
                        </div>
                    </div>
                    <div v-if="authStore.user.relationship" class="list-group-item px-0 py-3 d-flex align-items-center">
                        <i class="bi bi-heart-fill me-4 fs-4 text-muted"></i>
                        <div>
                            <p class="mb-0 fw-semibold">{{ authStore.user.relationship }}</p>
                            <small class="text-muted">Tình trạng mối quan hệ</small>
                        </div>
                    </div>
                    <div class="list-group-item px-0 py-3 d-flex align-items-center">
                        <i class="bi bi-envelope-fill me-4 fs-4 text-muted"></i>
                        <div>
                            <p class="mb-0 fw-semibold">{{ authStore.user.email }}</p>
                            <small class="text-muted">Địa chỉ email</small>
                        </div>
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
import PostCard from '../components/PostCard.vue'

const authStore = useAuthStore()

// File inputs refs
const avatarInput = ref(null)
const coverInput = ref(null)

// Form data
const form = ref({
  name: '',
  email: '',
  avatar: '',
  coverPhoto: '',
  bio: '',
  birthday: '',
  relationship: '',
  password: '',
  confirmPassword: ''
})

// State cho thông báo
const error = ref('')
const success = ref('')

// Tab state
const activeTab = ref('posts')

const isMyProfile = computed(() => true) // Assuming for now, can extend for public views

// Computed: Lấy bài viết của user hiện tại
const myPosts = computed(() => {
  return authStore.posts.filter(p => p.authorId === authStore.user?.id)
})

// Computed: Danh sách ảnh gần đây từ bài viết
const recentPhotos = computed(() => {
  const photos = []
  myPosts.value.forEach(post => {
    if (post.images && post.images.length > 0) {
      photos.push(...post.images)
    } else if (post.image) {
      photos.push(post.image)
    }
  })
  return photos.slice(0, 9) // Show grid of 9
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
const friendsCount = computed(() => followersCount.value) // Simplified for FB layout

// Load dữ liệu user vào form khi component mount
onMounted(() => {
  if (authStore.user) {
    Object.assign(form.value, {
      name: authStore.user.name || '',
      email: authStore.user.email || '',
      avatar: authStore.user.avatar || '',
      coverPhoto: authStore.user.coverPhoto || '',
      bio: authStore.user.bio || '',
      birthday: authStore.user.birthday ? authStore.user.birthday.split('T')[0] : '',
      relationship: authStore.user.relationship || ''
    })
  }
})

// Hàm format ngày tham gia
const formatJoinDate = (dateString) => {
  if (!dateString) return 'Chưa rõ'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Upload handlers
const triggerAvatarUpload = () => avatarInput.value.click()
const triggerCoverUpload = () => coverInput.value.click()

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const compressed = await compressImage(e.target.result, 300, 300, 0.7)
        form.value.avatar = compressed
        authStore.updateProfile({ avatar: compressed })
      } catch (err) {
        error.value = 'Không thể tải ảnh đại diện'
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const compressed = await compressImage(e.target.result, 1200, 450, 0.7)
        form.value.coverPhoto = compressed
        authStore.updateProfile({ coverPhoto: compressed })
      } catch (err) {
        error.value = 'Không thể tải ảnh bìa'
      }
    }
    reader.readAsDataURL(file)
  }
}

// Xử lý cập nhật thông tin
const handleUpdate = () => {
  error.value = ''
  success.value = ''

  if (form.value.password && form.value.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  try {
    authStore.updateProfile({
      name: form.value.name,
      email: form.value.email,
      bio: form.value.bio,
      birthday: form.value.birthday,
      relationship: form.value.relationship,
      password: form.value.password
    })
    success.value = 'Cập nhật thành công!'
    setTimeout(() => { success.value = ''; activeTab.value = 'posts' }, 2000)
  } catch (err) {
    error.value = err.message
  }
}

const handleDeletePost = (postId) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    try {
      authStore.deletePost(postId)
    } catch (err) {
      alert(err.message)
    }
  }
}
</script>

<style scoped>
.cover-container {
  height: 350px;
  background: #f0f2f5;
  overflow: hidden;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-content {
  margin-top: -60px;
  position: relative;
  z-index: 2;
}

.avatar-wrapper {
  width: 168px;
  height: 168px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-nav .nav-link {
  color: #65676b;
  border-radius: 0;
  border-bottom: 3px solid transparent;
}

.profile-nav .nav-link:hover {
  background: #f2f2f2;
}

.profile-nav .nav-link.active {
  color: #0866ff;
  background: transparent;
  border-bottom: 3px solid #0866ff;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.hover-bg-gray:hover {
  background-color: #e4e6e9 !important;
}

/* Intro and details vertical spacing */
.intro-details i {
  width: 20px;
  text-align: center;
}

/* Photo grid rounded corners */
.photo-item:first-child { border-top-left-radius: 8px; }
.photo-item:nth-child(3) { border-top-right-radius: 8px; }
.photo-item:last-child { border-bottom-right-radius: 8px; }
.photo-item:nth-last-child(3) { border-bottom-left-radius: 8px; }

@media (max-width: 991px) {
  .header-content {
    flex-direction: column;
    align-items: center !important;
    text-align: center;
    margin-top: -84px;
  }
  
  .header-info {
    margin: 1rem 0 !important;
  }
  
  .avatar-wrapper {
    width: 140px;
    height: 140px;
  }
  
  .cover-container {
    height: 200px;
  }
  
  .profile-nav {
    justify-content: center;
  }
}
</style>