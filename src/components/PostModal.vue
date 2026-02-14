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
              <select v-model="form.category" class="form-select border-0 bg-light shadow-none fw-semibold" required>
                <option value="" disabled>Chọn danh mục...</option>
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
              <button type="button" class="btn btn-ghost shadow-none p-1 text-black"><i class="bi bi-person-plus-fill fs-5"></i></button>
              <button type="button" class="btn btn-ghost shadow-none p-1 text-black"><i class="bi bi-emoji-smile fs-5"></i></button>
              <button type="button" class="btn btn-ghost shadow-none p-1 text-black"><i class="bi bi-geo-alt-fill fs-5"></i></button>
              <button type="button" class="btn btn-ghost shadow-none p-1 text-black"><i class="bi bi-three-dots fs-5"></i></button>
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
import { compressImage } from '../utils/imageHelper'
import Editor from './Editor.vue'

const props = defineProps({
  id: { type: String, default: 'postModal' },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initialData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['saved', 'closed'])

const authStore = useAuthStore()
const modalRef = ref(null)
const fileInput = ref(null)
let modalInstance = null

const loading = ref(false)
const showImageUpload = ref(false)

const form = ref({
  id: null,
  title: '',
  category: '',
  content: '',
  images: []
})

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    category: '',
    content: '',
    images: []
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
      images: props.initialData.images ? [...props.initialData.images] : (props.initialData.image ? [props.initialData.image] : [])
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

const handleSubmit = async () => {
  loading.value = true
  try {
    const postData = {
      title: form.value.title,
      category: form.value.category,
      content: form.value.content,
      // For simplicity, we store the first image in 'image' and all in 'images'
      image: form.value.images.length > 0 ? form.value.images[0] : '',
      images: form.value.images
    }

    if (props.mode === 'create') {
      await authStore.createPost(postData)
      alert('Đăng bài thành công!')
    } else {
      await authStore.updatePost(form.value.id, postData)
      alert('Cập nhật bài viết thành công!')
    }
    
    emit('saved')
    hide()
    resetForm()
  } catch (err) {
    alert('Lỗi: ' + err.message)
  } finally {
    loading.value = false
  }
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
