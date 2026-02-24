import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
      const notifications = ref([])

      /**
       * Add a new notification
       * @param {Object} notification { type: 'success' | 'error' | 'info', title: string, message: string }
       */
      const addNotification = (notification) => {
            const id = Date.now()
            const newNotification = {
                  id,
                  type: notification.type || 'info',
                  title: notification.title || '',
                  message: notification.message || '',
                  createdAt: new Date()
            }

            notifications.value.push(newNotification)

            // Tự động xóa sau 5 giây
            setTimeout(() => {
                  removeNotification(id)
            }, 5000)

            return id
      }

      const removeNotification = (id) => {
            notifications.value = notifications.value.filter(n => n.id !== id)
      }

      return {
            notifications,
            addNotification,
            removeNotification
      }
})
