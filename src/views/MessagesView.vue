<template>
  <div class="messages-page bg-light min-vh-100 py-3 py-lg-4">
    <div class="container h-100">
      <div class="card shadow-sm border-dark h-100 overflow-hidden" style="min-height: 80vh;">
        <div class="row g-0 h-100" style="min-height: 80vh;">
          <!-- Conversation List -->
          <div class="col-lg-4 border-end border-dark d-flex flex-column h-100 bg-white">
            <div class="p-3 border-bottom border-dark bg-light flex-column gap-2 d-flex">
              <div class="d-flex align-items-center justify-content-between">
                <h5 class="fw-bold mb-0">Tin nhắn</h5>
                <button class="btn btn-black btn-sm rounded-pill px-3" @click="showFriendsOnly = !showFriendsOnly">
                  <i class="bi" :class="showFriendsOnly ? 'bi-chat-left-text' : 'bi-person-plus'"></i>
                  {{ showFriendsOnly ? 'Đoạn chat' : 'Bạn bè' }}
                </button>
              </div>
              <div class="position-relative">
                <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input 
                  v-model="searchFriendsQuery" 
                  type="text" 
                  class="form-control form-control-sm border-dark rounded-pill ps-5 shadow-none" 
                  placeholder="Tìm kiếm..."
                >
              </div>
            </div>
            
            <div class="flex-grow-1 overflow-auto bg-white">
              <!-- Friends List (New Message Mode) -->
              <div v-if="showFriendsOnly || (chatStore.conversations.length === 0 && !searchFriendsQuery)" class="list-group list-group-flush">
                <div class="p-3 bg-light border-bottom border-dark">
                  <small class="fw-bold text-uppercase text-muted" style="letter-spacing: 1px;">{{ showFriendsOnly ? 'Tất cả bạn bè' : 'Gợi ý nhắn tin' }}</small>
                </div>
                <button 
                  v-for="friend in filteredFriends" 
                  :key="friend.id"
                  @click="selectUser(friend.id)"
                  class="list-group-item list-group-item-action p-3 border-dark d-flex align-items-center gap-3"
                  :class="{ active: selectedUserId === friend.id }"
                >
                  <img :src="friend.avatar" class="rounded-circle border border-dark" width="50" height="50" style="object-fit: cover;">
                  <div class="flex-grow-1 overflow-hidden">
                    <h6 class="fw-bold mb-0 text-truncate">{{ friend.name }}</h6>
                    <small class="text-muted">Nhấn để bắt đầu trò chuyện</small>
                  </div>
                </button>
                <div v-if="filteredFriends.length === 0" class="text-center py-5 px-3">
                  <i class="bi bi-people display-4 text-muted opacity-25"></i>
                  <p class="text-muted mt-2">Không tìm thấy bạn bè nào.</p>
                </div>
              </div>

              <!-- Normal Conversation List -->
              <div v-else class="list-group list-group-flush">
                <button 
                  v-for="conv in filteredConversations" 
                  :key="conv.userId"
                  @click="selectUser(conv.userId)"
                  class="list-group-item list-group-item-action p-3 border-dark d-flex align-items-center gap-3"
                  :class="{ active: selectedUserId === conv.userId }"
                >
                  <div class="position-relative">
                    <img :src="conv.user?.avatar" class="rounded-circle border border-dark" width="50" height="50" style="object-fit: cover;">
                    <span v-if="conv.unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {{ conv.unreadCount }}
                    </span>
                  </div>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h6 class="fw-bold mb-0 text-truncate">{{ conv.user?.name }}</h6>
                      <small class="text-muted" style="font-size: 0.7rem;">{{ formatShortTime(conv.lastMessage.createdAt) }}</small>
                    </div>
                    <p class="mb-0 text-muted small text-truncate" :class="{ 'fw-bold text-dark': conv.unreadCount > 0 }">
                      {{ conv.lastMessage.senderId === authStore.user?.id ? 'Bạn: ' : '' }}{{ conv.lastMessage.content }}
                    </p>
                  </div>
                </button>
                <div v-if="filteredConversations.length === 0" class="text-center py-5 px-3">
                  <p class="text-muted">Không tìm thấy cuộc trò chuyện nào.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Window -->
          <div class="col-lg-8 d-flex flex-column h-100 bg-white shadow-inner">
            <template v-if="selectedUser">
              <!-- Chat Header -->
              <div class="p-3 border-bottom border-dark bg-light d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <router-link :to="`/profile/${selectedUser.id}`" class="text-decoration-none d-flex align-items-center gap-2">
                    <img :src="selectedUser.avatar" class="rounded-circle border border-dark" width="40" height="40" style="object-fit: cover;">
                    <div>
                      <h6 class="fw-bold mb-0 text-dark">{{ selectedUser.name }}</h6>
                      <small class="text-success fw-semibold" style="font-size: 0.7rem;">Đang hoạt động</small>
                    </div>
                  </router-link>
                </div>
                <div class="d-flex gap-1">
                  <button class="btn btn-ghost-dark btn-sm rounded-circle p-0 flex-center" style="width: 36px; height: 36px;"><i class="bi bi-telephone fs-5"></i></button>
                  <button class="btn btn-ghost-dark btn-sm rounded-circle p-0 flex-center" style="width: 36px; height: 36px;"><i class="bi bi-camera-video fs-5"></i></button>
                  <button class="btn btn-ghost-dark btn-sm rounded-circle p-0 flex-center" style="width: 36px; height: 36px;" data-bs-toggle="dropdown"><i class="bi bi-info-circle fs-5"></i></button>
                </div>
              </div>

              <!-- Messages List -->
              <div class="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2 bg-chat" ref="messageContainer">
                <div 
                  v-for="msg in currentMessages" 
                  :key="msg.id"
                  class="d-flex"
                  :class="msg.senderId === authStore.user?.id ? 'justify-content-end' : 'justify-content-start'"
                >
                  <div class="max-w-75">
                    <div 
                      class="msg-bubble px-3 py-2 border border-dark overflow-hidden"
                      :class="msg.senderId === authStore.user?.id ? 'bg-black text-white rounded-sent' : 'bg-white rounded-received'"
                    >
                      <div v-if="msg.image" class="mb-2">
                        <img :src="msg.image" class="img-fluid rounded message-img" alt="shared image">
                      </div>
                      <div v-if="msg.content">{{ msg.content }}</div>
                    </div>
                    <small class="text-muted mt-1 px-1" style="font-size: 0.65rem;" :class="msg.senderId === authStore.user?.id ? 'd-block text-end' : 'd-block text-start'">
                      {{ formatTime(msg.createdAt) }}
                    </small>
                  </div>
                </div>
                <div v-if="currentMessages.length === 0" class="text-center py-5 mt-5">
                   <img :src="selectedUser.avatar" class="rounded-circle border border-dark mb-3" width="80" height="80" style="object-fit: cover;">
                   <h5 class="fw-bold">{{ selectedUser.name }}</h5>
                   <p class="text-muted small">Hãy bắt đầu câu chuyện với {{ selectedUser.name }}!</p>
                </div>
              </div>

              <!-- Message Input -->
              <div class="p-3 border-top border-dark bg-white">
                <form @submit.prevent="handleSendMessage" class="d-flex gap-2 align-items-center">
                  <input type="file" ref="imageInput" class="d-none" accept="image/*" @change="handleImageUpload">
                  <button 
                    type="button" 
                    class="btn btn-ghost-dark p-0 flex-center" 
                    style="width: 36px; height: 36px;"
                    @click="imageInput?.click()"
                    :disabled="isSendingImage"
                  >
                    <i class="bi" :class="isSendingImage ? 'spinner-border spinner-border-sm' : 'bi-images fs-5'"></i>
                  </button>
                  <input 
                    v-model="newMessage" 
                    type="text" 
                    class="form-control border border-dark rounded-pill px-3 shadow-none" 
                    placeholder="Nhập tin nhắn..."
                    ref="msgInput"
                    :disabled="isSendingImage"
                  >
                  <button 
                    type="submit" 
                    class="btn btn-black rounded-circle p-0 flex-center" 
                    style="width: 40px; height: 40px;"
                    :disabled="!newMessage.trim() || isSendingImage"
                  >
                    <i class="bi bi-send-fill fs-5"></i>
                  </button>
                </form>
              </div>
            </template>
            <div v-else class="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center p-5">
              <div class="bg-light rounded-circle shadow-inner d-flex align-items-center justify-content-center mb-4" style="width: 120px; height: 120px;">
                <i class="bi bi-chat-square-dots display-1 text-muted opacity-25"></i>
              </div>
              <h4 class="fw-bold">Chọn một cuộc trò chuyện</h4>
              <p class="text-muted">Hoặc bắt đầu một cuộc trò chuyện mới với người khác từ trang cá nhân của họ.</p>
              <button @click="$router.push('/')" class="btn btn-black px-4 mt-3 fw-bold rounded-pill border-dark">Tìm bạn bè</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useDialogStore } from '../stores/dialog'
import { compressImage } from '../utils/imageHelper'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const dialogStore = useDialogStore()

const selectedUserId = ref(null)
const newMessage = ref('')
const messageContainer = ref(null)
const msgInput = ref(null)
const imageInput = ref(null)
const isSendingImage = ref(false)
const showFriendsOnly = ref(false)
const searchFriendsQuery = ref('')

// Lấy danh sách bạn bè (người user đang follow)
const friends = computed(() => {
  if (!authStore.user) return []
  const followingIds = authStore.user.following || []
  return authStore.users.filter(u => followingIds.includes(u.id))
})

const filteredFriends = computed(() => {
  const q = searchFriendsQuery.value.toLowerCase().trim()
  if (!q) return friends.value
  return friends.value.filter(f => f.name?.toLowerCase().includes(q))
})

const filteredConversations = computed(() => {
  const q = searchFriendsQuery.value.toLowerCase().trim()
  const convs = chatStore.conversations
  if (!q) return convs
  return convs.filter(c => c.user?.name?.toLowerCase().includes(q))
})

const selectedUser = computed(() => {
  if (!selectedUserId.value) return null
  return authStore.users.find(u => Number(u.id) === Number(selectedUserId.value))
})

const currentMessages = computed(() => {
  if (!selectedUserId.value) return []
  return chatStore.getMessagesWith(Number(selectedUserId.value))
})

const selectUser = (userId) => {
  selectedUserId.value = Number(userId)
  showFriendsOnly.value = false
  chatStore.markAsRead(Number(userId))
  scrollToBottom()
  nextTick(() => {
    msgInput.value?.focus()
  })
}

const handleSendMessage = () => {
  if (!newMessage.value.trim() || !selectedUserId.value) return
  chatStore.sendMessage(selectedUserId.value, newMessage.value.trim())
  newMessage.value = ''
  scrollToBottom()
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file || !selectedUserId.value) return
  
  const reader = new FileReader()
  reader.onload = async (event) => {
    try {
      isSendingImage.value = true
      const compressed = await compressImage(event.target.result)
      chatStore.sendMessage(selectedUserId.value, '', compressed)
      scrollToBottom()
    } catch (err) {
      console.error('Lỗi nén ảnh:', err)
      dialogStore.alert('Không thể nén hoặc gửi ảnh. Vui lòng thử lại.', 'error')
    } finally {
      isSendingImage.value = false
      if (imageInput.value) imageInput.value.value = ''
    }
  }
  reader.onerror = () => {
    dialogStore.alert('Không thể đọc file ảnh.', 'error')
  }
  reader.readAsDataURL(file)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatShortTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) return formatTime(dateStr)
  if (diff < 604800000) return date.toLocaleDateString('vi-VN', { weekday: 'short' })
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

// Theo dõi query user_id để tự động chọn cuộc trò chuyện
watch(() => route.query.user_id, (newId) => {
  if (newId) {
    selectUser(newId)
  }
}, { immediate: true })

onMounted(() => {
  if (route.query.user_id) {
    selectUser(route.query.user_id)
  }
})
</script>

<style scoped>
.messages-page {
  height: calc(100vh - 70px);
}
.shadow-inner {
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg-bubble {
  max-width: 100%;
  word-wrap: break-word;
  font-size: 0.95rem;
  box-shadow: 2px 2px 0 rgba(0,0,0,1);
}
.message-img {
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}
.message-img:hover {
  transform: scale(1.02);
}
.bg-chat {
  background-color: #f8f9fa;
  background-image: radial-gradient(#dee2e6 1px, transparent 0);
  background-size: 20px 20px;
}
.rounded-sent {
  border-radius: 18px 18px 2px 18px;
}
.rounded-received {
  border-radius: 18px 18px 18px 2px;
}
.btn-ghost-dark:hover {
  background-color: #f0f2f5;
}
.list-group-item.active {
  background-color: #f0f2f5 !important;
  border-color: #000 !important;
  color: #000 !important;
}
.max-w-75 {
  max-width: 75%;
}
.btn-black {
  background-color: #000;
  color: #fff;
  transition: all 0.2s;
}
.btn-black:hover {
  background-color: #222;
  transform: translateY(-1px);
}
.btn-black:disabled {
  background-color: #666;
  opacity: 0.7;
}
/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
