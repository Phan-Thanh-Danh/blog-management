<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body p-5">
            <h2 class="text-center mb-4">Đăng ký tài khoản</h2>
            
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label">Họ và tên</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  class="form-control" 
                  required
                  placeholder="Nhập họ và tên"
                >
              </div>

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
                  minlength="6"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Xác nhận mật khẩu</label>
                <input 
                  v-model="form.confirmPassword" 
                  type="password" 
                  class="form-control" 
                  required
                  placeholder="Nhập lại mật khẩu"
                >
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>

              <button type="submit" class="btn btn-primary w-100 mb-3">
                <i class="bi bi-person-plus"></i> Đăng ký
              </button>

              <p class="text-center mb-0">
                Đã có tài khoản? 
                <router-link to="/login">Đăng nhập ngay</router-link>
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
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')

const handleRegister = () => {
  error.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  try {
    authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    })
    
    alert('Đăng ký thành công! Vui lòng đăng nhập.')
    router.push('/login')
  } catch (err) {
    error.value = err.message
  }
}
</script>