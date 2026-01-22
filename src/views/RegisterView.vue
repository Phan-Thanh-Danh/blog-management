<template>
  <div class="auth-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-10 col-lg-8">
          <div class="row shadow-lg rounded-4 overflow-hidden bg-white">
            <!-- Left Side - Image -->
            <div class="col-md-6 d-none d-md-block p-0">
              <div class="auth-side-panel h-100 d-flex align-items-center justify-content-center">
                <div class="text-center text-white p-5">
                  <i class="bi bi-people" style="font-size: 5rem; opacity: 0.9;"></i>
                  <h3 class="mt-4 fw-bold">Tham gia ngay hôm nay!</h3>
                  <p class="lead">Trở thành thành viên của cộng đồng</p>
                  <div class="mt-4">
                    <i class="bi bi-star me-2"></i> Hoàn toàn miễn phí<br>
                    <i class="bi bi-star me-2"></i> Không giới hạn bài viết<br>
                    <i class="bi bi-star me-2"></i> Kết nối với mọi người
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side - Form -->
            <div class="col-md-6 p-5">
              <div class="text-center mb-4">
                <i class="bi bi-person-plus-fill text-primary" style="font-size: 3rem;"></i>
                <h2 class="fw-bold mt-3">Đăng ký tài khoản</h2>
                <p class="text-muted">Tạo tài khoản để bắt đầu</p>
              </div>
              
              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label class="form-label fw-bold">
                    <i class="bi bi-person"></i> Họ và tên
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    class="form-control form-control-lg" 
                    required
                    placeholder="Nguyễn Văn A"
                  >
                </div>

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
                      minlength="6"
                      placeholder="Tối thiểu 6 ký tự"
                    >
                    <button 
                      @click="showPassword = !showPassword"
                      class="btn btn-outline-secondary" 
                      type="button"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div class="password-strength mt-2">
                    <div class="progress" style="height: 5px;">
                      <div 
                        class="progress-bar" 
                        :class="passwordStrengthClass"
                        :style="{ width: passwordStrength + '%' }"
                      ></div>
                    </div>
                    <small class="text-muted">{{ passwordStrengthText }}</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">
                    <i class="bi bi-shield-check"></i> Xác nhận mật khẩu
                  </label>
                  <input 
                    v-model="form.confirmPassword" 
                    type="password" 
                    class="form-control form-control-lg" 
                    required
                    placeholder="Nhập lại mật khẩu"
                  >
                </div>

                <div v-if="error" class="alert alert-danger alert-dismissible fade show">
                  <i class="bi bi-exclamation-triangle"></i> {{ error }}
                  <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
                  <i class="bi bi-person-plus"></i> Đăng ký
                </button>

                <div class="text-center">
                  <p class="text-muted mb-0">
                    Đã có tài khoản? 
                    <router-link to="/login" class="text-primary fw-bold text-decoration-none">
                      Đăng nhập ngay
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
const showPassword = ref(false)

// Password strength indicator
const passwordStrength = computed(() => {
  const password = form.value.password
  if (password.length === 0) return 0
  if (password.length < 6) return 33
  if (password.length < 10) return 66
  return 100
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 33) return 'bg-danger'
  if (passwordStrength.value <= 66) return 'bg-warning'
  return 'bg-success'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value === 0) return ''
  if (passwordStrength.value <= 33) return 'Yếu'
  if (passwordStrength.value <= 66) return 'Trung bình'
  return 'Mạnh'
})

const handleRegister = () => {
  error.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
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

.password-strength {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>