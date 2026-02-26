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
        <div class="search-form mx-lg-3 my-2 my-lg-0 position-relative">
          <form @submit.prevent="handleSearch" class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Tìm kiếm bài viết, người dùng..."
              @focus="isSearchFocused = true"
            />
            <button v-if="searchQuery" type="button" class="search-clear" @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </form>

          <!-- Quick Search Results -->
          <div v-if="isSearchFocused && searchQuery.trim()" class="search-results-preview dropdown-menu show shadow-lg border-dark p-2 mt-1">
             <div v-if="quickResults.users.length > 0">
                <h6 class="dropdown-header text-uppercase small fw-bold px-2">Người dùng</h6>
                <router-link 
                  v-for="u in quickResults.users" 
                  :key="u.id" 
                  :to="`/profile/${u.id}`"
                  class="dropdown-item d-flex align-items-center gap-2 py-2 rounded"
                  @click="searchQuery = ''; isSearchFocused = false"
                >
                  <img :src="u.avatar" class="rounded-circle border" width="30" height="30" style="object-fit: cover;">
                  <span class="fw-semibold small">{{ u.name }}</span>
                </router-link>
             </div>
             <div v-if="quickResults.posts.length > 0" :class="{ 'mt-2 border-top pt-2': quickResults.users.length > 0 }">
                <h6 class="dropdown-header text-uppercase small fw-bold px-2">Bài viết</h6>
                <router-link 
                  v-for="p in quickResults.posts" 
                  :key="p.id" 
                  :to="`/post/${p.id}`"
                  class="dropdown-item py-2 rounded"
                  @click="searchQuery = ''; isSearchFocused = false"
                >
                  <div class="fw-semibold small text-truncate">{{ p.title }}</div>
                  <div class="x-small text-muted">{{ p.category || 'Chung' }}</div>
                </router-link>
             </div>
             <div v-if="quickResults.users.length === 0 && quickResults.posts.length === 0" class="p-3 text-center text-muted small">
                Không tìm thấy kết quả nào
             </div>
             <div class="border-top mt-2 pt-2 text-center">
                <a href="#" @click.prevent="handleSearch" class="text-primary small fw-bold text-decoration-none">
                  Xem tất cả kết quả cho "{{ searchQuery }}"
                </a>
             </div>
          </div>
        </div>

        <!-- Right Nav -->
        <ul class="navbar-nav align-items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item">
              <button @click="navigateTo('home-create')" class="btn btn-create">
                <i class="bi bi-plus-lg me-1"></i> Đăng bài
              </button>
            </li>

            <!-- Messages -->
            <li class="nav-item">
              <router-link to="/messages" class="notif-bell-btn" title="Tin nhắn">
                <i class="bi bi-chat-dots"></i>
                <span v-if="chatStore.totalUnreadCount > 0" class="notif-badge">{{ chatStore.totalUnreadCount > 9 ? '9+' : chatStore.totalUnreadCount }}</span>
              </router-link>
            </li>

            <!-- Notification Bell -->
            <li class="nav-item">
              <router-link to="/notifications" class="notif-bell-btn" title="Thông báo">
                <i class="bi bi-bell"></i>
                <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </router-link>
            </li>

            <!-- Saved posts -->
            <li class="nav-item">
              <router-link to="/saved" class="notif-bell-btn" title="Bài viết đã lưu">
                <i class="bi bi-bookmark"></i>
                <span v-if="authStore.savedPosts?.length > 0" class="notif-badge saved-badge">{{ authStore.savedPosts.length }}</span>
              </router-link>
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
                <li>
                  <router-link to="/messages" class="dropdown-item" @click="closeDropdowns">
                    <i class="bi bi-chat-dots me-2"></i>Tin nhắn
                    <span v-if="chatStore.totalUnreadCount > 0" class="badge bg-danger ms-auto">{{ chatStore.totalUnreadCount }}</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/saved" class="dropdown-item" @click="closeDropdowns">
                    <i class="bi bi-bookmark me-2"></i>Bài đã lưu
                    <span v-if="authStore.savedPosts?.length > 0" class="badge bg-warning text-dark ms-auto">{{ authStore.savedPosts.length }}</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/notifications" class="dropdown-item" @click="closeDropdowns">
                    <i class="bi bi-bell me-2"></i>Thông báo
                    <span v-if="unreadCount > 0" class="badge bg-danger ms-auto">{{ unreadCount }}</span>
                  </router-link>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useActivityStore } from '../stores/activity'
import { useChatStore } from '../stores/chat'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const activityStore = useActivityStore()
const chatStore = useChatStore()
const router = useRouter()
const route = useRoute()

const unreadCount = computed(() => {
  if (!authStore.user) return 0
  return activityStore.getUnreadCount(authStore.user.id)
})

const searchQuery = ref('')
const isSearchFocused = ref(false)
const activeDropdown = ref(null)

const quickResults = computed(() => {
  if (!searchQuery.value.trim()) return { users: [], posts: [] }
  const q = searchQuery.value.toLowerCase()
  return {
    users: authStore.users.filter(u => u.name.toLowerCase().includes(q)).slice(0, 3),
    posts: authStore.posts.filter(p => p.title.toLowerCase().includes(q)).slice(0, 3)
  }
})

const closeDropdown = (e) => {
  if (!e.target.closest('.dropdown') && !e.target.closest('.btn-user-avatar') && !e.target.closest('.search-form')) {
    activeDropdown.value = null
    isSearchFocused.value = false
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

const closeDropdowns = () => {
  activeDropdown.value = null
  isSearchFocused.value = false
}

const navigateTo = (pathOrTag) => {
  activeDropdown.value = null
  if (pathOrTag === 'profile') {
    router.push('/profile')
  } else if (pathOrTag === 'home-create') {
    router.push({ path: '/', query: { action: 'create' } })
  } else {
    router.push({ path: '/search', query: { q: pathOrTag } })
  }
}

const handleSearch = () => {
  activeDropdown.value = null
  isSearchFocused.value = false
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
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

.search-results-preview {
  width: 100%;
  top: 100%;
  left: 0;
  z-index: 1001;
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

/* -- Notification Bell */
.notif-bell-btn {
  display: flex; align-items: center; justify-content: center;
  position: relative; width: 38px; height: 38px; border-radius: 50%;
  background: var(--gray-50); border: 1.5px solid var(--gray-200);
  color: var(--gray-700); font-size: 1.05rem; text-decoration: none;
  transition: all 0.2s ease;
}
.notif-bell-btn:hover { background: #eff6ff; color: #2563eb; }
.notif-bell-btn.router-link-active { background: #eff6ff; color: #2563eb; border-color: #93c5fd; }
.notif-badge {
  position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px;
  border-radius: 99px; background: #ef4444; color: #fff; font-size: 10px;
  font-weight: 700; display: flex; align-items: center; justify-content: center;
  padding: 0 4px; border: 2px solid #fff; font-family: 'Inter', sans-serif;
}
.notif-badge.saved-badge { background: #f59e0b; }
.x-small { font-size: 0.75rem; }
</style>
