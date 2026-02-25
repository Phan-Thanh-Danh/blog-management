import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
      const isOpen = ref(false)
      const type = ref('info') // 'info' | 'success' | 'error' | 'warning' | 'confirm'
      const title = ref('')
      const message = ref('')
      const confirmLabel = ref('Xác nhận')
      const cancelLabel = ref('Hủy')

      // Promise resolver cho confirm()
      let _resolve = null

      /**
       * Hiện thông báo đơn giản (thay alert)
       * @param {string} msg
       * @param {'info'|'success'|'error'|'warning'} dialogType
       * @param {string} dialogTitle
       */
      const alert = (msg, dialogType = 'info', dialogTitle = '') => {
            return new Promise((resolve) => {
                  title.value = dialogTitle || _defaultTitle(dialogType)
                  message.value = msg
                  type.value = dialogType
                  confirmLabel.value = 'Đóng'
                  cancelLabel.value = ''
                  isOpen.value = true
                  _resolve = resolve
            })
      }

      /**
       * Hiện hộp thoại xác nhận (thay confirm)
       * Trả về Promise<boolean>
       * @param {string} msg
       * @param {string} dialogTitle
       */
      const confirm = (msg, dialogTitle = 'Xác nhận') => {
            return new Promise((resolve) => {
                  title.value = dialogTitle
                  message.value = msg
                  type.value = 'confirm'
                  confirmLabel.value = 'Xác nhận'
                  cancelLabel.value = 'Hủy'
                  isOpen.value = true
                  _resolve = resolve
            })
      }

      const _defaultTitle = (t) => {
            const map = { info: 'Thông báo', success: 'Thành công', error: 'Lỗi', warning: 'Cảnh báo' }
            return map[t] || 'Thông báo'
      }

      // Gọi khi bấm nút xác nhận / đóng
      const handleConfirm = () => {
            isOpen.value = false
            if (_resolve) { _resolve(true); _resolve = null }
      }

      // Gọi khi bấm Hủy hoặc đóng backdrop
      const handleCancel = () => {
            isOpen.value = false
            if (_resolve) { _resolve(false); _resolve = null }
      }

      return {
            isOpen, type, title, message, confirmLabel, cancelLabel,
            alert, confirm,
            handleConfirm, handleCancel
      }
})
