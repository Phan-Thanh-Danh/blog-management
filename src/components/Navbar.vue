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
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">
              <i class="bi bi-house"></i> Trang chủ
            </router-link>
          </li>
          
          <!-- Danh mục Dropdown -->
          <li class="nav-item dropdown">
            <button 
              class="nav-link dropdown-toggle btn btn-link border-0" 
              type="button"
              @click="toggleDropdown('category')"
              :class="{ show: activeDropdown === 'category' }"
            >
              <i class="bi bi-grid"></i> Danh mục
            </button>
            <ul class="dropdown-menu shadow" :class="{ show: activeDropdown === 'category' }">
              <li v-for="cat in authStore.categories" :key="cat">
                <a class="dropdown-item" @click.prevent="navigateTo(cat)" href="#">{{ cat }}</a>
              </li>
            </ul>
          </li>

          <!-- Hashtag Dropdown -->
          <li class="nav-item dropdown">
            <button 
              class="nav-link dropdown-toggle btn btn-link border-0" 
              type="button"
              @click="toggleDropdown('trending')"
              :class="{ show: activeDropdown === 'trending' }"
            >
              <i class="bi bi-tags"></i> Xu hướng
            </button>
            <ul class="dropdown-menu shadow" :class="{ show: activeDropdown === 'trending' }">
              <li v-if="authStore.trendingTags.length === 0">
                <span class="dropdown-item text-muted small">Chưa có tag nào</span>
              </li>
              <li v-for="tag in authStore.trendingTags" :key="tag">
                <a class="dropdown-item" @click.prevent="navigateTo(tag)" href="#">{{ tag }}</a>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Thanh tìm kiếm -->
        <form @submit.prevent="handleSearch" class="d-flex mx-lg-3 my-2 my-lg-0 search-form flex-grow-1" style="max-width: 400px;">
          <div class="input-group">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control bg-light border-0" 
              placeholder="Tìm bài viết, #hashtag..."
            >
            <button class="btn btn-primary" type="submit">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </form>

        <ul class="navbar-nav align-items-center">
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item me-2">
              <router-link to="/create-post" class="btn btn-primary btn-sm rounded-pill px-3">
                <i class="bi bi-plus-lg"></i> Đăng bài
              </router-link>
            </li>
            <li class="nav-item dropdown">
              <button 
                class="nav-link dropdown-toggle d-flex align-items-center btn btn-link border-0" 
                type="button"
                @click="toggleDropdown('user')"
                :class="{ show: activeDropdown === 'user' }"
              >
                <img :src="authStore.user.avatar" class="rounded-circle me-1" width="30" height="30" alt="avatar">
                <span class="d-none d-lg-inline">{{ authStore.user.name }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow" :class="{ show: activeDropdown === 'user' }">
                <li><a href="#" class="dropdown-item" @click.prevent="navigateTo('profile')"><i class="bi bi-person me-2"></i>Tài khoản</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button @click="handleLogout" class="dropdown-item text-danger"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
              </ul>
            </li>
          </template>
          
          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="nav-link">Đăng nhập</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="btn btn-outline-light btn-sm ms-2">Đăng ký</router-link>
            </li>
          </template>

          <!-- Theme Toggle -->
          <li class="nav-item ms-lg-2">
            <button @click="toggleTheme" class="btn btn-link nav-link p-1" :title="isDark ? 'Chế độ sáng' : 'Chế độ tối'">
              <i class="bi" :class="isDark ? 'bi-sun-fill text-warning' : 'bi-moon-fill text-info'" style="font-size: 1.2rem;"></i>
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
const activeDropdown = ref(null)

onMounted(() => {
  // Theme initialization
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDark.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)

  // Close dropdown when clicking outside
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      activeDropdown.value = null
    }
  })
})

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const navigateTo = (pathOrTag) => {
  activeDropdown.value = null
  if (pathOrTag === 'profile') {
    router.push('/profile')
  } else {
    router.push({ path: '/', query: { search: pathOrTag } })
  }
}

const toggleTheme = () => {
  activeDropdown.value = null
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const handleSearch = () => {
  activeDropdown.value = null
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { search: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

const handleLogout = () => {
  activeDropdown.value = null
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.dropdown-menu.show {
  display: block;
}

.text-danger:hover {
  color: #ff0000 !important;
}

.nav-link {
  cursor: pointer;
}

/* Fix for button appearance in navbar */
.btn-link {
  text-decoration: none;
}
</style>