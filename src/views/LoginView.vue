<template>
  <div class="auth-page bg-white min-vh-100 d-flex align-items-center">
    <div class="container py-5">
      <div class="row align-items-center justify-content-center g-5">
        <!-- Left Side: Branding -->
        <div class="col-lg-6 text-center text-lg-start pe-lg-5">
          <h1 class="auth-logo fw-bold text-black mb-3" style="font-size: 4rem; letter-spacing: -2px;">MyBlog</h1>
          <h2 class="fw-normal lh-sm fs-2 mb-4 mb-lg-0 pe-xl-5 text-dark">
            Kết nối và chia sẻ những câu chuyện của bạn với mọi người một cách đơn giản nhất.
          </h2>
        </div>

        <!-- Right Side: Login Card -->
        <div class="col-md-8 col-lg-5 col-xl-4">
          <div class="card border border-dark shadow-sm rounded-3 p-3 bg-white">
            <div class="card-body">
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="form-control form-control-lg border-dark rounded-2 py-3 fs-6" 
                    required
                    placeholder="Email hoặc tên đăng nhập"
                  >
                </div>

                <div class="mb-3 position-relative">
                  <input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control form-control-lg border-dark rounded-2 py-3 fs-6" 
                    required
                    placeholder="Mật khẩu"
                  >
                  <button 
                    type="button"
                    @click="showPassword = !showPassword"
                    class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-black text-decoration-none pe-3 shadow-none"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                  </button>
                </div>

                <div v-if="error" class="alert alert-dark border border-dark rounded-2 small py-2 mb-3 bg-white text-black">
                  {{ error }}
                </div>

                <button type="submit" class="btn btn-black btn-lg w-100 fw-bold py-2 fs-5 mb-3 rounded-2 border-dark">
                  Đăng nhập
                </button>

                <div class="text-center mb-4">
                  <a href="#" class="text-black text-decoration-underline small">Quên mật khẩu?</a>
                </div>

                <hr class="border-dark opacity-100 mb-4">

                <div class="text-center">
                  <router-link to="/register" class="btn btn-outline-dark btn-lg fw-bold px-4 py-2 fs-6 rounded-pill">
                    Tạo tài khoản mới
                  </router-link>
                </div>
              </form>
            </div>
          </div>
          <div class="text-center mt-4 small">
            <p><strong>Quản lý Blog</strong> dành cho Content Creator và Writer chuyên nghiệp.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Simple Footer -->
    <div class="footer-simple position-fixed bottom-0 w-100 bg-white border-top border-dark py-3 d-none d-md-block">
      <div class="container text-black x-small">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex gap-3">
            <span>Tiếng Việt</span> <span>English</span> <span>日本語</span>
          </div>
          <div>MyBlog © 2024</div>
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
.auth-page {
  background-color: #ffffff;
}

.auth-logo {
  font-family: serif; /* Dùng font có chân cho cảm giác minimal/vogue */
}

.btn-black {
  background-color: #000000;
  color: #ffffff;
}

.btn-black:hover {
  background-color: #333333;
  color: #ffffff;
}

.btn-outline-dark:hover {
  background-color: #000000;
  color: #ffffff;
}

.form-control:focus {
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
}

.x-small {
  font-size: 11px;
}

@media (max-width: 991px) {
  .footer-simple {
    position: static;
  }
}
</style>
