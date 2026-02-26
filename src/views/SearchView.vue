<template>
  <div class="search-page min-vh-100 bg-light py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="d-flex align-items-center gap-3 mb-4">
            <button @click="router.back()" class="btn btn-white border border-dark rounded-circle p-0 flex-center" style="width: 40px; height: 40px;">
              <i class="bi bi-arrow-left"></i>
            </button>
            <h2 class="fw-bold mb-0">Kết quả tìm kiếm cho "{{ query }}"</h2>
          </div>

          <!-- Search Tabs -->
          <ul class="nav nav-pills mb-4 bg-white p-1 rounded-3 border border-dark shadow-sm">
            <li class="nav-item flex-grow-1">
              <button 
                class="nav-link w-100 fw-bold py-2" 
                :class="{ active: activeTab === 'posts' }"
                @click="activeTab = 'posts'"
              >
                Bài viết ({{ filteredPosts.length }})
              </button>
            </li>
            <li class="nav-item flex-grow-1">
              <button 
                class="nav-link w-100 fw-bold py-2" 
                :class="{ active: activeTab === 'users' }"
                @click="activeTab = 'users'"
              >
                Mọi người ({{ filteredUsers.length }})
              </button>
            </li>
          </ul>

          <!-- Posts Tab Content -->
          <div v-if="activeTab === 'posts'">
            <div v-if="filteredPosts.length === 0" class="text-center py-5 bg-white border border-dark rounded-3">
              <i class="bi bi-search display-1 text-muted opacity-25"></i>
              <h5 class="mt-3">Không tìm thấy bài viết nào</h5>
              <p class="text-muted">Thử tìm kiếm với từ khóa khác xem sao!</p>
            </div>
            <div v-else>
              <PostCard 
                v-for="post in filteredPosts" 
                :key="post.id" 
                :post="post"
              />
            </div>
          </div>

          <!-- Users Tab Content -->
          <div v-if="activeTab === 'users'">
            <div v-if="filteredUsers.length === 0" class="text-center py-5 bg-white border border-dark rounded-3">
              <i class="bi bi-people display-1 text-muted opacity-25"></i>
              <h5 class="mt-3">Không tìm thấy người dùng nào</h5>
              <p class="text-muted">Thử tìm bằng tên hoặc email chính xác hơn.</p>
            </div>
            <div v-else class="card shadow-none border border-dark overflow-hidden">
              <div class="list-group list-group-flush">
                <div v-for="user in filteredUsers" :key="user.id" class="list-group-item p-3 border-dark">
                  <div class="d-flex align-items-center justify-content-between">
                    <router-link :to="`/profile/${user.id}`" class="d-flex align-items-center text-decoration-none text-dark flex-grow-1">
                      <img :src="user.avatar" class="rounded-circle border border-dark me-3" width="60" height="60" style="object-fit: cover;">
                      <div>
                        <h6 class="fw-bold mb-0">{{ user.name }}</h6>
                        <p class="text-muted small mb-0">{{ user.email }}</p>
                      </div>
                    </router-link>
                    <button 
                      v-if="authStore.user && user.id !== authStore.user.id"
                      @click="authStore.toggleFollow(user.id)"
                      class="btn btn-sm px-4 fw-bold rounded-pill border border-dark shadow-none"
                      :class="authStore.isFollowing(user.id) ? 'btn-white' : 'btn-black'"
                    >
                      {{ authStore.isFollowing(user.id) ? 'Đang theo dõi' : 'Theo dõi' }}
                    </button>
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const query = computed(() => route.query.q || '')
const activeTab = ref('posts')

const filteredPosts = computed(() => {
  if (!query.value) return []
  const q = query.value.toLowerCase()
  return authStore.visiblePosts.filter(p => 
    p.title.toLowerCase().includes(q) || 
    p.content.toLowerCase().includes(q) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
  )
})

const filteredUsers = computed(() => {
  return authStore.searchUsers(query.value)
})

// Mặc định chuyển sang tab có kết quả nếu tab hiện tại trống
watch([filteredPosts, filteredUsers], () => {
  if (activeTab.value === 'posts' && filteredPosts.value.length === 0 && filteredUsers.value.length > 0) {
    activeTab.value = 'users'
  } else if (activeTab.value === 'users' && filteredUsers.value.length === 0 && filteredPosts.value.length > 0) {
    activeTab.value = 'posts'
  }
}, { immediate: true })
</script>

<style scoped>
.nav-pills .nav-link {
  color: #1c1e21;
  border-radius: 6px;
}
.nav-pills .nav-link.active {
  background-color: #000;
  color: #fff;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-black {
  background-color: #000;
  color: #fff;
}
.btn-black:hover {
  background-color: #222;
  color: #fff;
}
.btn-white:hover {
  background-color: #f8f9fa;
}
</style>
