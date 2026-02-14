<template>
  <div class="create-post-wrapper py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-dark py-3">
              <h2 class="mb-0">
                <i class="bi bi-plus-circle"></i> Tạo bài viết mới
              </h2>
            </div>
            
            <div class="card-body p-4 p-md-5">
              <form @submit.prevent="handleSubmit">
                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-type"></i> Tiêu đề <span class="text-danger">*</span>
                  </label>
                  <input 
                    v-model="form.title" 
                    type="text" 
                    class="form-control form-control-lg" 
                    required
                    placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                  >
                  <small class="text-muted">{{ form.title.length }}/200 ký tự</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-grid"></i> Danh mục <span class="text-danger">*</span>
                  </label>
                  <select v-model="form.category" class="form-select" required>
                    <option value="" disabled>-- Chọn danh mục --</option>
                    <option v-for="cat in authStore.categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-file-text"></i> Nội dung <span class="text-danger">*</span>
                  </label>
                  <Editor 
                    v-model="form.content" 
                    :height="400"
                  />
                  <small class="text-muted">{{ form.content ? form.content.length : 0 }} ký tự</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-image"></i> Hình ảnh minh họa
                  </label>
                  <input 
                    type="file" 
                    multiple
                    @change="handleImageUpload"
                    class="form-control"
                    accept="image/*"
                  >
                  <small class="text-muted">Chọn một hoặc nhiều ảnh (tối đa 2MB/ảnh)</small>
                </div>

                <!-- Preview Images -->
                <div v-if="form.images.length > 0" class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-eye"></i> Xem trước ({{ form.images.length }} ảnh)
                  </label>
                  <div class="row g-2">
                    <div v-for="(img, index) in form.images" :key="index" class="col-4 col-md-3 position-relative">
                      <div class="ratio ratio-1x1">
                        <img :src="img" class="img-fluid rounded border object-fit-cover" alt="Preview">
                      </div>
                      <button 
                        @click="removeImage(index)" 
                        type="button" 
                        class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-1 lh-1"
                        style="width: 24px; height: 24px;"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-3">
                  <button type="submit" class="btn btn-primary btn-lg flex-grow-1">
                    <i class="bi bi-send"></i> Đăng bài
                  </button>
                  <router-link to="/" class="btn btn-outline-secondary btn-lg">
                    <i class="bi bi-x-circle"></i> Hủy
                  </router-link>
                </div>
              </form>
            </div>
          </div>

          <!-- Tips Card -->
          <div class="card shadow-sm mt-4">
            <div class="card-body">
              <h5 class="fw-bold mb-3">
                <i class="bi bi-lightbulb text-warning"></i> Gợi ý viết bài hay
              </h5>
              <ul class="mb-0">
                <li class="mb-2">Tiêu đề ngắn gọn, súc tích và thu hút</li>
                <li class="mb-2">Nội dung rõ ràng, hỗ trợ Markdown cơ bản:
                  <ul class="small text-muted">
                    <li>**Chữ đậm**</li>
                    <li>*Chữ nghiêng*</li>
                    <li>[Tên link](url)</li>
                    <li>`code block`</li>
                  </ul>
                </li>
                <li class="mb-2">Sử dụng hình ảnh chất lượng cao</li>
                <li class="mb-2">Chia sẻ kinh nghiệm thực tế</li>
                <li>Tương tác với người đọc qua bình luận</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { compressImage } from '../utils/imageHelper'
import Editor from '../components/Editor.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  title: '',
  category: '',
  content: '',
  images: []
})

// Khôi phục bản nháp nếu có
onMounted(() => {
  try {
    const savedDraft = localStorage.getItem('post_draft')
    if (savedDraft) {
      const draft = JSON.parse(savedDraft)
      if (confirm('Bạn có một bài viết đang viết dở. Bạn có muốn khôi phục không?')) {
        form.value = draft
      } else {
        localStorage.removeItem('post_draft')
      }
    }
  } catch (e) {
    console.error('Lỗi khi đọc bản nháp:', e)
  }
})

// Tự động lưu bản nháp khi form thay đổi
watch(form, async (newVal) => {
  if (newVal.title || newVal.content || newVal.images.length > 0) {
    try {
      localStorage.setItem('post_draft', JSON.stringify(newVal))
    } catch (e) {
      console.warn('Không thể lưu bản nháp: Bộ nhớ đầy')
      // Nếu là lỗi bộ nhớ, không hiển thị alert gây phiền người dùng lúc đang gõ
    }
  }
}, { deep: true })

const handleImageUpload = async (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            // Nén ảnh trước khi lưu
            const compressed = await compressImage(e.target.result, 1024, 1024, 0.7)
            form.value.images.push(compressed)
          } catch (err) {
            console.error('Lỗi nén ảnh:', err)
            alert('Không thể nén ảnh: ' + file.name)
          }
        }
        reader.readAsDataURL(file)
    }
  }
  event.target.value = ''
}

const removeImage = (index) => {
    form.value.images.splice(index, 1)
}

const handleSubmit = () => {
  try {
    authStore.createPost(form.value)
    // Xóa bản nháp sau khi đăng bài thành công
    localStorage.removeItem('post_draft')
    alert('Đăng bài viết thành công!')
    router.push('/')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.create-post-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  border: none;
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.image-preview {
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
  padding: 1rem;
}

.image-preview img {
  max-height: 350px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

ul li {
  color: #6c757d;
}
</style>