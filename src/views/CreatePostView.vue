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
                    <i class="bi bi-file-text"></i> Nội dung <span class="text-danger">*</span>
                  </label>
                  <textarea 
                    v-model="form.content" 
                    class="form-control" 
                    rows="12" 
                    required
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                  ></textarea>
                  <small class="text-muted">{{ form.content.length }} ký tự</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-image"></i> Hình ảnh minh họa
                  </label>
                  <input 
                    v-model="form.image" 
                    type="url" 
                    class="form-control"
                    placeholder="https://example.com/image.jpg"
                  >
                  <small class="text-muted">Dán URL hình ảnh hoặc để trống</small>
                </div>

                <!-- Preview Image -->
                <div v-if="form.image" class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-eye"></i> Xem trước
                  </label>
                  <div class="image-preview">
                    <img :src="form.image" class="img-fluid rounded" alt="Preview">
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
                <li class="mb-2">Nội dung rõ ràng, dễ hiểu</li>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  title: '',
  content: '',
  image: ''
})

const handleSubmit = () => {
  try {
    authStore.createPost(form.value)
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