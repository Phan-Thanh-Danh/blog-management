<template>
  <div class="auth-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-10 col-lg-8">
          <div class="row shadow-lg rounded-4 overflow-hidden bg-white">
            <!-- Left Side - Form -->
            <div class="col-md-6 p-5">
              <div class="text-center mb-4">
                <i class="bi bi-journals text-primary" style="font-size: 3rem;"></i>
                <h2 class="fw-bold mt-3">Đăng nhập</h2>
                <p class="text-muted">Chào mừng bạn quay trở lại!</p>
              </div>
              
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label fw-bold">
                    <i class="bi bi-envelope"></i> Email
                  </label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="form-control form-control-lg" 
                    required
                    placeholder="example@email.com"
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">
                    <i class="bi bi-lock"></i> Mật khẩu
                  </label>
                  <div class="input-group">
                    <input 
                      v-model="form.password" 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control form-control-lg" 
                      required
                      placeholder="Nhập mật khẩu"
                    >
                    <button 
                      @click="showPassword = !showPassword"
                      class="btn btn-outline-secondary" 
                      type="button"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger alert-dismissible fade show">
                  <i class="bi bi-exclamation-triangle"></i> {{ error }}
                  <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
                  <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
                </button>

                <div class="text-center">
                  <p class="text-muted mb-0">
                    Chưa có tài khoản? 
                    <router-link to="/register" class="text-primary fw-bold text-decoration-none">
                      Đăng ký ngay
                    </router-link>
                  </p>
                </div>
              </form>
            </div>

            <!-- Right Side - Image -->
            <div class="col-md-6 d-none d-md-block p-0">
              <div class="auth-side-panel h-100 d-flex align-items-center justify-content-center">
                <div class="text-center text-white p-5">
                  <i class="bi bi-chat-quote" style="font-size: 5rem; opacity: 0.9;"></i>
                  <h3 class="mt-4 fw-bold">Kết nối & Chia sẻ</h3>
                  <p class="lead">Tham gia cộng đồng blogger năng động</p>
                  <div class="mt-4">
                    <i class="bi bi-check-circle me-2"></i> Viết bài miễn phí<br>
                    <i class="bi bi-check-circle me-2"></i> Tương tác với cộng đồng<br>
                    <i class="bi bi-check-circle me-2"></i> Chia sẻ kiến thức
                  </div>
                </div>
              </div>
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
  email: '',
  password: ''
})

const error = ref('')
const showPassword = ref(false)

const handleLogin = () => {
  error.value = ''
  
  try {
    authStore.login(form.value.email, form.value.password)
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.auth-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.auth-side-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>