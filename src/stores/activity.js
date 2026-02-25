import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActivityStore = defineStore('activity', () => {
      const activities = ref([])

      // Load từ localStorage
      const loadData = () => {
            const saved = localStorage.getItem('activities')
            if (saved) {
                  try {
                        activities.value = JSON.parse(saved)
                  } catch {
                        activities.value = []
                  }
            }
      }
      loadData()

      const save = () => {
            // Giữ tối đa 100 hoạt động gần nhất
            if (activities.value.length > 100) {
                  activities.value = activities.value.slice(0, 100)
            }
            localStorage.setItem('activities', JSON.stringify(activities.value))
      }

      /**
       * Thêm hoạt động mới
       * @param {Object} activity
       * @param {'like'|'comment'|'follow'|'reply'|'bookmark'} activity.type
       * @param {number} activity.targetUserId - người nhận thông báo
       * @param {number} activity.actorId - người thực hiện
       * @param {string} activity.actorName
       * @param {string} activity.actorAvatar
       * @param {number} [activity.postId]
       * @param {string} [activity.postTitle]
       * @param {string} [activity.commentContent]
       */
      const addActivity = (activity) => {
            const newActivity = {
                  id: Date.now(),
                  ...activity,
                  createdAt: new Date().toISOString(),
                  read: false
            }
            activities.value.unshift(newActivity)
            save()
      }

      // Thông báo dành cho user hiện tại
      const getMyActivities = (userId) => {
            return activities.value.filter(a => a.targetUserId === userId)
      }

      const getUnreadCount = (userId) => {
            return activities.value.filter(a => a.targetUserId === userId && !a.read).length
      }

      const markAllRead = (userId) => {
            activities.value.forEach(a => {
                  if (a.targetUserId === userId) a.read = true
            })
            save()
      }

      const markRead = (activityId) => {
            const act = activities.value.find(a => a.id === activityId)
            if (act) act.read = true
            save()
      }

      const clearAll = (userId) => {
            activities.value = activities.value.filter(a => a.targetUserId !== userId)
            save()
      }

      return {
            activities,
            addActivity,
            getMyActivities,
            getUnreadCount,
            markAllRead,
            markRead,
            clearAll
      }
})
