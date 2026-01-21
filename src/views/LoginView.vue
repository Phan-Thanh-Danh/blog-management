<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-body p-5">
            <h2 class="text-center mb-4">Đăng nhập</h2>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="form-control" 
                  required
                  placeholder="Nhập email"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Mật khẩu</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  class="form-control" 
                  required
                  placeholder="Nhập mật khẩu"
                >
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>

              <button type="submit" class="btn btn-primary w-100 mb-3">
                <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
              </button>

              <p class="text-center mb-0">
                Chưa có tài khoản? 
                <router-link to="/register">Đăng ký ngay</router-link>
              </p>
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
  email: '',
  password: ''
})

const error = ref('')

const handleLogin = () => {
  error.value = ''
  
  try {
    authStore.login(form.value.email, form.value.password)
    alert('Đăng nhập thành công!')
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>