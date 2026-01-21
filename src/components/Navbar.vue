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
        <ul class="navbar-nav ms-auto">
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
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

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