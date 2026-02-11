<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-journals"></i> MyBlog
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Thanh tìm kiếm -->
        <form @submit.prevent="handleSearch" class="d-flex ms-auto me-3 my-2 my-lg-0 search-form">
          <div class="input-group">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm bài viết..."
            >
            <button class="btn btn-primary" type="submit">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </form>

        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/" class="nav-link">
              <i class="bi bi-house"></i> Trang chủ
            </router-link>
          </li>
          
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item">
              <router-link to="/create-post" class="nav-link">
                <i class="bi bi-plus-circle"></i> Đăng bài
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/profile" class="nav-link">
                <i class="bi bi-person"></i> Tài khoản
              </router-link>
            </li>
            <li class="nav-item">
              <button @click="handleLogout" class="btn btn-link nav-link">
                <i class="bi bi-box-arrow-right"></i> Đăng xuất
              </button>
            </li>
          </template>
          
          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="nav-link">
                <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="nav-link">
                <i class="bi bi-person-plus"></i> Đăng ký
              </router-link>
            </li>
          </template>

          <!-- Dark Mode Toggle -->
          <li class="nav-item">
            <button @click="toggleTheme" class="btn btn-link nav-link" :title="isDark ? 'Chế độ sáng' : 'Chế độ tối'">
              <i class="bi" :class="isDark ? 'bi-sun-fill text-warning' : 'bi-moon-fill text-info'"></i>
            </button>
          </li>

          <!-- Nút Reset Data - Chỉ dùng khi develop -->
          <li class="nav-item">
            <button 
              @click="resetData" 
              class="btn btn-link nav-link text-danger"
              title="Xóa toàn bộ dữ liệu"
            >
              <i class="bi bi-trash"></i> Reset
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('')
const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDark.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { search: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// Hàm xóa toàn bộ dữ liệu localStorage
const resetData = () => {
  if (confirm('⚠️ Bạn có chắc muốn xóa TOÀN BỘ dữ liệu?\n\n- Tất cả tài khoản\n- Tất cả bài viết\n- Tất cả bình luận\n\nHành động này KHÔNG THỂ hoàn tác!')) {
    // Xóa toàn bộ localStorage
    localStorage.clear()
    
    // Hiển thị thông báo
    alert('✅ Đã xóa toàn bộ dữ liệu thành công!')
    
    // Reload lại trang
    location.reload()
  }
}
</script>

<style scoped>
.text-danger:hover {
  color: #ff0000 !important;
}
</style>