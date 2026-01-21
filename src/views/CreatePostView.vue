<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="mb-4">Tạo bài viết mới</h2>
            
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Tiêu đề</label>
                <input 
                  v-model="form.title" 
                  type="text" 
                  class="form-control" 
                  required
                  placeholder="Nhập tiêu đề bài viết"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Nội dung</label>
                <textarea 
                  v-model="form.content" 
                  class="form-control" 
                  rows="8" 
                  required
                  placeholder="Nhập nội dung bài viết"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Hình ảnh (URL)</label>
                <input 
                  v-model="form.image" 
                  type="url" 
                  class="form-control"
                  placeholder="https://example.com/image.jpg"
                >
                <small class="text-muted">Để trống nếu không muốn thêm hình ảnh</small>
              </div>

              <div v-if="form.image" class="mb-3">
                <label class="form-label">Xem trước hình ảnh:</label>
                <img :src="form.image" class="img-fluid rounded" alt="Preview" style="max-height: 300px;">
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-send"></i> Đăng bài
                </button>
                <router-link to="/" class="btn btn-secondary">
                  <i class="bi bi-x-circle"></i> Hủy
                </router-link>
              </div>
            </form>
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