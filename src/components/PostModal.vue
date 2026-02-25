<template>
  <div class="modal fade" :id="id" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <!-- Modal Header -->
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold flex-grow-1 text-center">
            {{ mode === 'create' ? 'Tạo bài viết' : 'Chỉnh sửa bài viết' }}
          </h5>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" @click="emit('closed')"></button>
        </div>

        <hr class="mx-3 my-2">

        <!-- Modal Body -->
        <div class="modal-body pt-0" style="max-height: 80vh; overflow-y: auto;">
          <!-- User info -->
          <div class="d-flex align-items-center mb-3">
            <img :src="authStore.user?.avatar" class="rounded-circle border me-2" width="45" height="45" style="object-fit: cover;">
            <div>
              <h6 class="fw-bold mb-0">{{ authStore.user?.name }}</h6>
              <span class="badge bg-light text-dark border fw-normal">
                <i class="bi bi-globe me-1"></i> Công khai
              </span>
            </div>
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- Title -->
            <div class="mb-3">
              <input 
                v-model="form.title" 
                type="text" 
                class="form-control form-control-lg border-0 shadow-none px-0 fs-4 fw-bold" 
                placeholder="Tiêu đề bài viết..."
                required
              >
            </div>

            <!-- Category -->
            <div class="mb-3">
              <select v-model="form.category" class="form-select border-0 bg-light shadow-none fw-semibold">
                <option value="">Không có danh mục (Chung)</option>
                <option v-for="cat in authStore.categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Content Editor -->
            <div class="mb-3">
              <Editor 
                v-model="form.content" 
                :placeholder="`${authStore.user?.name} ơi, bạn đang nghĩ gì thế?`"
                class="border-0"
              />
            </div>

            <!-- AI Summary Section -->
            <div v-if="form.content.replace(/<[^>]*>?/gm, '').length > 50" class="mb-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="fw-bold small mb-0"><i class="bi bi-stars text-primary me-1"></i>Tóm tắt bởi AI</label>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary border-0 shadow-none py-0"
                  @click="handleAISummary"
                  :disabled="summarizing"
                >
                  <span v-if="summarizing" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-magic me-1"></i>
                  {{ form.summary ? 'Tóm tắt lại' : 'Tạo tóm tắt' }}
                </button>
              </div>
              <textarea 
                v-model="form.summary" 
                class="form-control bg-light border-0 shadow-none small" 
                rows="2" 
                placeholder="Tóm tắt ngắn gọn bài viết sẽ hiển thị ở trang chủ..."
              ></textarea>
            </div>

            <!-- Image Upload Section -->
            <div v-if="showImageUpload" class="border rounded p-3 mb-3 position-relative bg-light">
              <button type="button" class="btn-close position-absolute top-0 end-0 m-2" @click="closeImageUpload"></button>
              
              <div v-if="form.images.length === 0" class="upload-area py-5 text-center border shadow-sm rounded bg-white cursor-pointer" @click="triggerFileUpload">
                <div class="bg-light rounded-circle d-inline-flex p-3 mb-2">
                  <i class="bi bi-images fs-4"></i>
                </div>
                <h6 class="fw-bold">Thêm ảnh/video</h6>
                <p class="text-muted small mb-0">Hoặc kéo và thả</p>
                <input type="file" ref="fileInput" class="d-none" multiple @change="handleImageUpload" accept="image/*">
              </div>

              <div v-else class="preview-grid d-flex flex-wrap gap-2 pt-2">
                <div v-for="(img, index) in form.images" :key="index" class="position-relative">
                  <img :src="img" class="rounded border" style="width: 100px; height: 100px; object-fit: cover;">
                  <button type="button" class="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-1 p-0 flex-center" style="width: 20px; height: 20px;" @click="removeImage(index)">
                    <i class="bi bi-x small"></i>
                  </button>
                </div>
                <button type="button" class="btn btn-outline-secondary rounded d-flex flex-column justify-content-center align-items-center shadow-sm bg-white" style="width: 100px; height: 100px;" @click="triggerFileUpload">
                   <i class="bi bi-plus-lg fs-4"></i>
                   <span class="small">Thêm</span>
                   <input type="file" ref="fileInput" class="d-none" multiple @change="handleImageUpload" accept="image/*">
                </button>
              </div>
            </div>

            <!-- Add to your post bar -->
            <div class="mb-3 d-flex align-items-center justify-content-between p-2 rounded-2 border border-dark">
            <span class="small fw-bold text-black">Thêm vào bài viết</span>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-ghost shadow-none p-1 text-black" @click="showImageUpload = true"><i class="bi bi-images fs-5"></i></button>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-black w-100 fw-bold py-2 rounded-2 border-dark"
            :disabled="loading || !form.title || !form.content"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ mode === 'create' ? 'Đăng' : 'Cập nhật' }}
          </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useAuthStore } from '../stores/auth'
import { useDialogStore } from '../stores/dialog'
import { useNotificationStore } from '../stores/notification'
import { useActivityStore } from '../stores/activity'
import { compressImage } from '../utils/imageHelper'
import { generateSummary } from '../utils/geminiService'
import Editor from './Editor.vue'

const props = defineProps({
  id: { type: String, default: 'postModal' },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initialData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['saved', 'closed'])

const authStore = useAuthStore()
const dialogStore = useDialogStore()
const notificationStore = useNotificationStore()
const activityStore = useActivityStore()
const modalRef = ref(null)
const fileInput = ref(null)
let modalInstance = null

const loading = ref(false)
const summarizing = ref(false)
const showImageUpload = ref(false)

const form = ref({
  id: null,
  title: '',
  category: '',
  content: '',
  images: [],
  summary: ''
})

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    category: '',
    content: '',
    images: [],
    summary: ''
  }
  showImageUpload.value = false
}

const syncForm = () => {
  if (props.mode === 'edit' && props.initialData && Object.keys(props.initialData).length > 0) {
    form.value = {
      id: props.initialData.id,
      title: props.initialData.title || '',
      category: props.initialData.category || '',
      content: props.initialData.content || '',
      images: props.initialData.images ? [...props.initialData.images] : (props.initialData.image ? [props.initialData.image] : []),
      summary: props.initialData.summary || ''
    }
    if (form.value.images.length > 0) showImageUpload.value = true
  } else {
    resetForm()
  }
}

watch([() => props.initialData, () => props.mode], syncForm, { immediate: true, deep: true })

onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value)
  }
})

const show = () => {
  syncForm()
  modalInstance?.show()
}
const hide = () => modalInstance?.hide()

defineExpose({ show, hide })

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event) => {
  const files = event.target.files
  if (!files) return

  for (let file of files) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const compressed = await compressImage(e.target.result, 1200, 1200, 0.7)
        form.value.images.push(compressed)
      } catch (err) {
        console.error('Nén ảnh thất bại:', err)
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const closeImageUpload = () => {
  showImageUpload.value = false
  form.value.images = []
}

const handleAISummary = async () => {
  if (!form.value.content) return
  summarizing.value = true
  try {
    const summary = await generateSummary(form.value.content)
    form.value.summary = summary
  } catch (err) {
    dialogStore.alert('Không thể tạo tóm tắt: ' + err.message, 'error', 'Lỗi AI')
  } finally {
    summarizing.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const postData = {
      title: form.value.title,
      category: form.value.category,
      content: form.value.content,
      // For simplicity, we store the first image in 'image' and all in 'images'
      image: form.value.images.length > 0 ? form.value.images[0] : '',
      images: form.value.images,
      summary: form.value.summary
    }

    if (props.mode === 'create') {
      const newPost = await authStore.createPost(postData)
      notificationStore.addNotification({ type: 'success', title: 'Đăng bài thành công', message: 'Bài viết của bạn đã được đăng.' })
      
      // Gửi thông báo cho những người được tag
      handleMentionNotifications(form.value.content, newPost.id, newPost.title)
    } else {
      await authStore.updatePost(form.value.id, postData)
      notificationStore.addNotification({ type: 'success', title: 'Cập nhật thành công', message: 'Bài viết đã được cập nhật.' })
      
      // Gửi thông báo cho những người được tag (có thể lọc trùng nếu cần, ở đây gửi đơn giản trước)
      handleMentionNotifications(form.value.content, form.value.id, postData.title)
    }
    
    emit('saved')
    hide()
    resetForm()
  } catch (err) {
    dialogStore.alert('Lỗi: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// Logic gửi thông báo khi được tag
const handleMentionNotifications = (content, postId, postTitle) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const mentions = doc.querySelectorAll('.mention')
  
  // Dùng Set để tránh gửi thông báo trùng cho cùng 1 người trong 1 bài
  const mentionedUserIds = new Set()
  
  mentions.forEach(el => {
    const userId = el.getAttribute('data-user-id')
    if (userId) mentionedUserIds.add(parseInt(userId))
  })
  
  mentionedUserIds.forEach(targetUserId => {
    // Không gửi thông báo cho chính mình nếu tự tag mình
    if (targetUserId !== authStore.user.id) {
      activityStore.addActivity({
        type: 'mention',
        targetUserId: targetUserId,
        actorId: authStore.user.id,
        actorName: authStore.user.name,
        actorAvatar: authStore.user.avatar,
        postId: postId,
        postTitle: postTitle
      })
    }
  })
}
</script>

<style scoped>
.modal-content {
  border-radius: 12px;
}

.upload-area {
  border: 2px dashed #ddd !important;
  transition: all 0.2s ease;
}

.upload-area:hover {
  background-color: #f0f2f5 !important;
}

.cursor-pointer {
  cursor: pointer;
}

.btn-icon {
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Custom scrollbar for modal body */
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.modal-body::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
