<template>
  <div class="fb-register-page bg-fb-gray min-vh-100 d-flex flex-column align-items-center justify-content-center py-5">
    <div class="mb-4">
      <h1 class="fb-logo fw-bold text-primary" style="font-size: 3.5rem; letter-spacing: -1.5px;">facebook</h1>
    </div>
    
    <div class="card border-0 shadow-lg rounded-3 overflow-hidden bg-white" style="max-width: 432px; width: 100%;">
      <div class="card-header bg-white border-bottom p-3">
        <h2 class="fw-bold fs-3 mb-0">Đăng ký</h2>
        <p class="text-muted small mb-0">Nhanh chóng và dễ dàng.</p>
      </div>
      
      <div class="card-body p-3">
        <form @submit.prevent="handleRegister">
          <div class="row g-2 mb-3">
            <div class="col-12">
              <input 
                v-model="form.name" 
                type="text" 
                class="form-control bg-light-gray x-small-padding" 
                required
                placeholder="Họ và tên"
              >
            </div>
          </div>

          <div class="mb-3">
            <input 
              v-model="form.email" 
              type="email" 
              class="form-control bg-light-gray x-small-padding" 
              required
              placeholder="Số di động hoặc email"
            >
          </div>

          <div class="mb-3">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'"
              class="form-control bg-light-gray x-small-padding" 
              required
              minlength="6"
              placeholder="Mật khẩu mới"
            >
            <div class="password-strength mt-2 px-1">
              <div class="progress" style="height: 4px;">
                <div 
                  class="progress-bar" 
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrength + '%' }"
                ></div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-muted" style="font-size: 10px;">Độ bảo mật: {{ passwordStrengthText }}</small>
                <button type="button" @click="showPassword = !showPassword" class="btn btn-link p-0 text-muted x-small-text text-decoration-none">
                  {{ showPassword ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              class="form-control bg-light-gray x-small-padding" 
              required
              placeholder="Xác nhận mật khẩu"
            >
          </div>

          <div class="mb-3">
            <label class="form-label x-small-text text-muted mb-1">Ngày sinh <i class="bi bi-question-circle-fill"></i></label>
            <div class="row g-2">
              <div class="col-4">
                <select class="form-select x-small-padding border-secondary-subtle"><option v-for="d in 31" :key="d">{{d}}</option></select>
              </div>
              <div class="col-4">
                <select class="form-select x-small-padding border-secondary-subtle"><option v-for="m in 12" :key="m">Tháng {{m}}</option></select>
              </div>
              <div class="col-4">
                <select class="form-select x-small-padding border-secondary-subtle"><option v-for="y in 100" :key="y">{{2024 - y + 1}}</option></select>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label x-small-text text-muted mb-1">Giới tính <i class="bi bi-question-circle-fill"></i></label>
            <div class="row g-2">
              <div class="col-4">
                <div class="border rounded p-2 d-flex justify-content-between align-items-center x-small-text">
                  <label class="form-check-label px-2">Nữ</label>
                  <input class="form-check-input" type="radio" name="gender" value="female">
                </div>
              </div>
              <div class="col-4">
                <div class="border rounded p-2 d-flex justify-content-between align-items-center x-small-text">
                  <label class="form-check-label px-2">Nam</label>
                  <input class="form-check-input" type="radio" name="gender" value="male">
                </div>
              </div>
              <div class="col-4">
                <div class="border rounded p-2 d-flex justify-content-between align-items-center x-small-text">
                  <label class="form-check-label px-2">Khác</label>
                  <input class="form-check-input" type="radio" name="gender" value="other">
                </div>
              </div>
            </div>
          </div>

          <p class="terms-text text-muted mb-4">
            Bằng cách nhấp vào Đăng ký, bạn đồng ý với <a href="#">Điều khoản</a>, <a href="#">Chính sách quyền riêng tư</a> và <a href="#">Chính sách cookie</a> của chúng tôi. Bạn có thể nhận được thông báo qua SMS từ chúng tôi và có thể hủy nhận bất kỳ lúc nào.
          </p>

          <div v-if="error" class="alert alert-danger border-0 small py-2 mb-3">
            {{ error }}
          </div>

          <div class="text-center mb-3">
            <button type="submit" class="btn btn-success fw-bold px-5 py-2 fs-5" style="min-width: 194px;">
              Đăng ký
            </button>
          </div>

          <div class="text-center">
            <router-link to="/login" class="text-primary text-decoration-none small fw-bold">
              Bạn đã có tài khoản?
            </router-link>
          </div>
        </form>
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
  if (passwordStrength.value === 0) return 'Trống'
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
.bg-fb-gray { background-color: #f0f2f5; }
.text-primary { color: #0866ff !important; }
.bg-light-gray { background-color: #f5f6f7; border: 1px solid #dddfe2; }
.btn-success { background-color: #00a400; border: none; }
.btn-success:hover { background-color: #008f00; }

.fb-logo {
  font-family: Arial, sans-serif;
}

.x-small-padding {
  padding: 8px 10px;
}

.x-small-text {
  font-size: 12px;
}

.terms-text {
  font-size: 11px;
  line-height: 1.34;
}

.terms-text a {
  text-decoration: none;
  color: #385898;
}

.terms-text a:hover {
  text-decoration: underline;
}

.form-select:focus, .form-control:focus {
  border-color: #dddfe2;
  box-shadow: none;
}

.card-header {
  border-top-left-radius: 8px !important;
  border-top-right-radius: 8px !important;
}
</style>
