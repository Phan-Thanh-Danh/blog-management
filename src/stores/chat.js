import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
      const authStore = useAuthStore()
      const messages = ref([]) // [{id, senderId, receiverId, content, createdAt, read}]

      // Load data from localStorage
      const loadData = () => {
            const savedMessages = localStorage.getItem('chat_messages')
            if (savedMessages) {
                  messages.value = JSON.parse(savedMessages)
            }
      }

      // Save data to localStorage
      const saveData = () => {
            localStorage.setItem('chat_messages', JSON.stringify(messages.value))
      }

      // Lấy danh sách cuộc trò chuyện của user hiện tại
      const conversations = computed(() => {
            if (!authStore.user) return []

            const currentUserId = authStore.user.id
            const userMap = {} // userId -> lastMessage

            messages.value.forEach(msg => {
                  if (msg.senderId === currentUserId || msg.receiverId === currentUserId) {
                        const otherId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId
                        if (!userMap[otherId] || new Date(msg.createdAt) > new Date(userMap[otherId].createdAt)) {
                              userMap[otherId] = msg
                        }
                  }
            })

            const result = Object.entries(userMap).map(([userId, lastMsg]) => {
                  const otherUser = authStore.users.find(u => Number(u.id) === Number(userId))
                  if (!otherUser) return null

                  return {
                        userId: Number(userId),
                        user: otherUser,
                        lastMessage: lastMsg,
                        unreadCount: messages.value.filter(m =>
                              m.receiverId === currentUserId &&
                              m.senderId === Number(userId) &&
                              !m.read
                        ).length
                  }
            }).filter(conv => conv !== null)

            return result.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
      })

      // Lấy tin nhắn giữa user hiện tại và một user khác
      const getMessagesWith = (otherUserId) => {
            if (!authStore.user) return []
            const currentUserId = authStore.user.id
            return messages.value.filter(msg =>
                  (msg.senderId === currentUserId && msg.receiverId === otherUserId) ||
                  (msg.senderId === otherUserId && msg.receiverId === currentUserId)
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }

      // Gửi tin nhắn
      const sendMessage = (receiverId, content) => {
            if (!authStore.user) return
            const newMessage = {
                  id: Date.now(),
                  senderId: authStore.user.id,
                  receiverId: Number(receiverId),
                  content,
                  createdAt: new Date().toISOString(),
                  read: false
            }
            messages.value.push(newMessage)
            saveData()
            return newMessage
      }

      // Đánh dấu đã đọc
      const markAsRead = (otherUserId) => {
            if (!authStore.user) return
            const currentUserId = authStore.user.id
            messages.value.forEach(msg => {
                  if (msg.senderId === otherUserId && msg.receiverId === currentUserId) {
                        msg.read = true
                  }
            })
            saveData()
      }

      // Tổng số tin nhắn chưa đọc
      const totalUnreadCount = computed(() => {
            if (!authStore.user) return 0
            return messages.value.filter(m => m.receiverId === authStore.user.id && !m.read).length
      })

      loadData()

      return {
            messages,
            conversations,
            getMessagesWith,
            sendMessage,
            markAsRead,
            totalUnreadCount
      }
})
