<template>
  <div class="auth-page bg-white min-vh-100 d-flex flex-column align-items-center justify-content-center py-5">
    <div class="mb-4">
      <h1 class="auth-logo fw-bold text-black" style="font-size: 3.5rem; letter-spacing: -1.5px;">MyBlog</h1>
    </div>
    
    <div class="card border border-dark shadow-sm rounded-3 overflow-hidden bg-white" style="max-width: 432px; width: 100%;">
      <div class="card-header bg-white border-bottom border-dark p-3">
        <h2 class="fw-bold fs-3 mb-0 text-black">Đăng ký</h2>
        <p class="text-dark small mb-0 opacity-75">Nhanh chóng và dễ dàng trong không gian tối giản.</p>
      </div>
      
      <div class="card-body p-3">
        <form @submit.prevent="handleRegister">
          <div class="row g-2 mb-3">
            <div class="col-12">
              <input 
                v-model="form.name" 
                type="text" 
                class="form-control border-dark rounded-2 x-small-padding" 
                required
                placeholder="Họ và tên"
              >
            </div>
          </div>

          <div class="mb-3">
            <input 
              v-model="form.email" 
              type="email" 
              class="form-control border-dark rounded-2 x-small-padding" 
              required
              placeholder="Số di động hoặc email"
            >
          </div>

          <div class="mb-3">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'"
              class="form-control border-dark rounded-2 x-small-padding" 
              required
              minlength="6"
              placeholder="Mật khẩu mới"
            >
            <div class="password-strength mt-2 px-1">
              <div class="progress rounded-pill border border-dark" style="height: 6px; background-color: #fff;">
                <div 
                  class="progress-bar" 
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrength + '%' }"
                ></div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-black" style="font-size: 10px;">Độ bảo mật: {{ passwordStrengthText }}</small>
                <button type="button" @click="showPassword = !showPassword" class="btn btn-link p-0 text-black x-small-text text-decoration-underline shadow-none">
                  {{ showPassword ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              class="form-control border-dark rounded-2 x-small-padding" 
              required
              placeholder="Xác nhận mật khẩu"
            >
          </div>

          <div class="mb-3">
            <label class="form-label x-small-text text-black fw-bold mb-1">Ngày sinh <i class="bi bi-question-circle-fill"></i></label>
            <div class="row g-2">
              <div class="col-4">
                <select class="form-select x-small-padding border-dark rounded-2 shadow-none"><option v-for="d in 31" :key="d">{{d}}</option></select>
              </div>
              <div class="col-4">
                <select class="form-select x-small-padding border-dark rounded-2 shadow-none"><option v-for="m in 12" :key="m">Tháng {{m}}</option></select>
              </div>
              <div class="col-4">
                <select class="form-select x-small-padding border-dark rounded-2 shadow-none"><option v-for="y in 100" :key="y">{{2024 - y + 1}}</option></select>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label x-small-text text-black fw-bold mb-1">Giới tính <i class="bi bi-question-circle-fill"></i></label>
            <div class="row g-2">
              <div class="col-4">
                <div class="border border-dark rounded-2 p-2 d-flex justify-content-between align-items-center x-small-text bg-white">
                  <label class="form-check-label px-1">Nữ</label>
                  <input class="form-check-input border-dark" type="radio" name="gender" value="female">
                </div>
              </div>
              <div class="col-4">
                <div class="border border-dark rounded-2 p-2 d-flex justify-content-between align-items-center x-small-text bg-white">
                  <label class="form-check-label px-1">Nam</label>
                  <input class="form-check-input border-dark" type="radio" name="gender" value="male">
                </div>
              </div>
              <div class="col-4">
                <div class="border border-dark rounded-2 p-2 d-flex justify-content-between align-items-center x-small-text bg-white">
                  <label class="form-check-label px-1">Khác</label>
                  <input class="form-check-input border-dark" type="radio" name="gender" value="other">
                </div>
              </div>
            </div>
          </div>

          <p class="terms-text text-black opacity-75 mb-4">
            Bằng cách nhấp vào Đăng ký, bạn đồng ý với <a href="#" class="text-decoration-underline text-black fw-bold">Điều khoản</a> của nhà phát triển. Bạn có thể nhận được thông báo quan trọng qua email.
          </p>

          <div v-if="error" class="alert alert-dark border border-dark rounded-2 small py-2 mb-3 bg-white text-black">
            {{ error }}
          </div>

          <div class="text-center mb-3">
            <button type="submit" class="btn btn-black fw-bold px-5 py-2 fs-5 rounded-pill w-100 border-dark">
              Đăng ký
            </button>
          </div>

          <div class="text-center">
            <router-link to="/login" class="text-black text-decoration-underline small fw-bold">
              Bạn đã có tài khoản? Quay lại đăng nhập
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
import { useDialogStore } from '../stores/dialog'

const router = useRouter()
const authStore = useAuthStore()
const dialogStore = useDialogStore()

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
  if (passwordStrength.value <= 33) return 'bg-dark opacity-25'
  if (passwordStrength.value <= 66) return 'bg-dark opacity-50'
  return 'bg-dark'
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
    
    await dialogStore.alert('Đăng ký thành công! Vui lòng đăng nhập.', 'success', 'Thành công')
    router.push('/login')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.auth-page {
  background-color: #ffffff;
}

.auth-logo {
  font-family: serif;
}

.btn-black {
  background-color: #000000;
  color: #ffffff;
}

.btn-black:hover {
  background-color: #333333;
  color: #ffffff;
}

.x-small-padding {
  padding: 10px 12px;
}

.x-small-text {
  font-size: 12px;
}

.terms-text {
  font-size: 11px;
  line-height: 1.5;
}

.form-select:focus, .form-control:focus {
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
}

.form-check-input:checked {
  background-color: #000;
  border-color: #000;
}
</style>
