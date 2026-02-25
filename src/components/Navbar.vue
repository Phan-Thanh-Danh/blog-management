<template>
  <nav class="navbar navbar-expand-lg glass-effect navbar-glass sticky-top">
    <div class="container">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand brand-logo" @click="resetHome">
        <i class="bi bi-journals brand-icon"></i>
        <span class="brand-text">MyBlog</span>
      </router-link>

      <button class="navbar-toggler toggler-custom" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Left Nav Links -->
        <ul class="navbar-nav me-auto align-items-lg-center gap-1">
          <li class="nav-item">
            <router-link to="/" class="nav-link nav-link-custom" @click="resetHome">
              <i class="bi bi-house-door"></i> Trang chủ
            </router-link>
          </li>

          <!-- Danh mục Dropdown -->
          <li class="nav-item dropdown">
            <button
              class="nav-link nav-link-custom dropdown-toggle-custom"
              type="button"
              @click="toggleDropdown('category')"
              :class="{ active: activeDropdown === 'category' }"
            >
              <i class="bi bi-grid-3x3-gap"></i> Danh mục
              <i class="bi bi-chevron-down chevron-icon" :class="{ rotated: activeDropdown === 'category' }"></i>
            </button>
            <ul class="dropdown-menu dropdown-custom" :class="{ show: activeDropdown === 'category' }">
              <li v-for="cat in authStore.categories" :key="cat">
                <a class="dropdown-item" @click.prevent="navigateTo(cat)" href="#">
                  <i class="bi bi-tag me-2"></i>{{ cat }}
                </a>
              </li>
            </ul>
          </li>

          <!-- Xu hướng Dropdown -->
          <li class="nav-item dropdown">
            <button
              class="nav-link nav-link-custom dropdown-toggle-custom"
              type="button"
              @click="toggleDropdown('trending')"
              :class="{ active: activeDropdown === 'trending' }"
            >
              <i class="bi bi-fire"></i> Xu hướng
              <i class="bi bi-chevron-down chevron-icon" :class="{ rotated: activeDropdown === 'trending' }"></i>
            </button>
            <ul class="dropdown-menu dropdown-custom" :class="{ show: activeDropdown === 'trending' }">
              <li v-if="authStore.trendingTags.length === 0">
                <span class="dropdown-item text-muted small">Chưa có tag nào</span>
              </li>
              <li v-for="tag in authStore.trendingTags" :key="tag">
                <a class="dropdown-item" @click.prevent="navigateTo(tag)" href="#">
                  <i class="bi bi-hash me-1"></i>{{ tag }}
                </a>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Smart Search Bar -->
        <form @submit.prevent="handleSearch" class="search-form mx-lg-3 my-2 my-lg-0">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Tìm kiếm bài viết..."
            />
            <button v-if="searchQuery" type="button" class="search-clear" @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </form>

        <!-- Right Nav -->
        <ul class="navbar-nav align-items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item">
              <button @click="navigateTo('home-create')" class="btn btn-create">
                <i class="bi bi-plus-lg me-1"></i> Đăng bài
              </button>
            </li>

            <!-- User Dropdown -->
            <li class="nav-item dropdown">
              <button
                class="btn btn-user-avatar"
                type="button"
                @click="toggleDropdown('user')"
                :class="{ active: activeDropdown === 'user' }"
              >
                <img :src="authStore.user.avatar" class="avatar-img" width="34" height="34" alt="avatar" />
                <span class="d-none d-lg-inline ms-2 fw-semibold" style="font-size:0.9rem; color: var(--gray-800);">{{ authStore.user.name }}</span>
                <i class="bi bi-chevron-down chevron-icon ms-1" :class="{ rotated: activeDropdown === 'user' }"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end dropdown-custom" :class="{ show: activeDropdown === 'user' }">
                <li class="dropdown-header-user px-3 py-2">
                  <div class="fw-semibold" style="font-size:0.9rem;">{{ authStore.user.name }}</div>
                  <div class="text-muted" style="font-size:0.78rem;">{{ authStore.user.email }}</div>
                </li>
                <li><hr class="dropdown-divider my-1"></li>
                <li>
                  <a href="#" class="dropdown-item" @click.prevent="navigateTo('profile')">
                    <i class="bi bi-person-circle me-2"></i>Tài khoản
                  </a>
                </li>
                <li><hr class="dropdown-divider my-1"></li>
                <li>
                  <button @click="handleLogout" class="dropdown-item logout-item">
                    <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </button>
                </li>
              </ul>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="nav-link nav-link-custom fw-semibold">Đăng nhập</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="btn btn-register">Đăng ký</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('')
const activeDropdown = ref(null)

const closeDropdown = (e) => {
  if (!e.target.closest('.dropdown') && !e.target.closest('.btn-user-avatar')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const navigateTo = (pathOrTag) => {
  activeDropdown.value = null
  if (pathOrTag === 'profile') {
    router.push('/profile')
  } else if (pathOrTag === 'home-create') {
    router.push({ path: '/', query: { action: 'create' } })
  } else {
    router.push({ path: '/', query: { search: pathOrTag } })
  }
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

const resetHome = () => {
  activeDropdown.value = null
}
</script>

<style scoped>
/* ── Navbar Glass ─────────────────────────────────────────── */
.navbar-glass {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0.6rem 0;
  transition: box-shadow 0.3s ease;
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}

/* ── Brand ───────────────────────────────────────────────── */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--gray-900) !important;
}

.brand-icon {
  font-size: 1.5rem;
  color: var(--primary-500);
  transition: transform 0.3s ease;
}

.brand-logo:hover .brand-icon {
  transform: rotate(-6deg) scale(1.1);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Inter', serif;
  color: var(--gray-900);
  letter-spacing: -0.3px;
}

/* ── Nav Links ───────────────────────────────────────────── */
.nav-link-custom {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.45rem 0.8rem;
  border-radius: var(--radius-sm);
  color: var(--gray-600) !important;
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.nav-link-custom:hover,
.nav-link-custom.active {
  background-color: var(--gray-100);
  color: var(--gray-900) !important;
}

.nav-link-custom.router-link-active {
  background-color: var(--primary-50);
  color: var(--primary-600) !important;
}

/* ── Dropdown Toggle ─────────────────────────────────────── */
.dropdown-toggle-custom {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.45rem 0.8rem;
  border-radius: var(--radius-sm);
  color: var(--gray-600);
  font-weight: 500;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.dropdown-toggle-custom:hover,
.dropdown-toggle-custom.active {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

/* ── Chevron Animation ───────────────────────────────────── */
.chevron-icon {
  font-size: 0.65rem;
  transition: transform 0.25s ease;
}
.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* ── Custom Dropdown ─────────────────────────────────────── */
.dropdown-custom {
  border: 1px solid var(--gray-200) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-lg) !important;
  padding: 6px !important;
  min-width: 190px;
  animation: dropIn 0.2s ease forwards;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.dropdown-custom.show {
  display: block;
}

.dropdown-header-user {
  border-radius: var(--radius-sm);
  background: var(--gray-50);
}

/* ── Search Bar ──────────────────────────────────────────── */
.search-form {
  flex: 1;
  max-width: 380px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 13px;
  color: var(--gray-400);
  font-size: 0.9rem;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 2.2rem;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-full);
  background: var(--gray-50);
  color: var(--gray-900);
  font-size: 0.88rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
}

.search-input::placeholder {
  color: var(--gray-400);
}

.search-input:focus {
  border-color: var(--primary-400);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background-color: #fff;
}

.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 50%;
  transition: color 0.15s ease;
}
.search-clear:hover {
  color: var(--gray-700);
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn-create {
  background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 9999px !important;
  padding: 0.42rem 1.2rem !important;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  cursor: pointer;
  transition: all 0.22s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35) !important;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
}

.btn-create:hover {
  background: linear-gradient(135deg, #2563EB, #1D4ED8) !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.45) !important;
}

.btn-register {
  background: transparent;
  color: var(--primary-600) !important;
  border: 1.5px solid var(--primary-400) !important;
  border-radius: var(--radius-full) !important;
  padding: 0.4rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.22s ease;
}

.btn-register:hover {
  background: var(--primary-500);
  color: #fff !important;
  border-color: var(--primary-500) !important;
  transform: translateY(-1px);
}

/* ── User Avatar Button ──────────────────────────────────── */
.btn-user-avatar {
  display: flex;
  align-items: center;
  background: var(--gray-50);
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-full) !important;
  padding: 3px 10px 3px 3px;
  cursor: pointer;
  transition: all 0.22s ease;
  color: var(--gray-800);
}

.btn-user-avatar:hover,
.btn-user-avatar.active {
  border-color: var(--primary-400);
  background: var(--primary-50);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.avatar-img {
  border-radius: 50%;
  border: 2px solid var(--gray-200);
  object-fit: cover;
}

/* ── Logout Item ─────────────────────────────────────────── */
.logout-item {
  color: var(--error) !important;
  font-weight: 500;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  border-radius: var(--radius-sm) !important;
}

.logout-item:hover {
  background-color: var(--error-bg) !important;
  color: var(--error) !important;
}

/* ── Toggler ─────────────────────────────────────────────── */
.toggler-custom {
  border: 1.5px solid var(--gray-300) !important;
  border-radius: var(--radius-sm) !important;
}
</style>