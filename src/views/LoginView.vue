<template>
  <div class="fb-login-page bg-fb-gray min-vh-100 d-flex align-items-center">
    <div class="container py-5">
      <div class="row align-items-center justify-content-center g-5">
        <!-- Left Side: Branding -->
        <div class="col-lg-6 text-center text-lg-start pe-lg-5">
          <h1 class="fb-logo fw-bold text-primary mb-3" style="font-size: 4rem; letter-spacing: -2px;">facebook</h1>
          <h2 class="fw-normal lh-sm fs-2 mb-4 mb-lg-0 pe-xl-5">
            Facebook giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn.
          </h2>
        </div>

        <!-- Right Side: Login Card -->
        <div class="col-md-8 col-lg-5 col-xl-4">
          <div class="card border-0 shadow-lg rounded-3 p-3 bg-white">
            <div class="card-body">
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="form-control form-control-lg border-light-gray py-3 fs-6" 
                    required
                    placeholder="Email hoặc số điện thoại"
                  >
                </div>

                <div class="mb-3 position-relative">
                  <input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control form-control-lg border-light-gray py-3 fs-6" 
                    required
                    placeholder="Mật khẩu"
                  >
                  <button 
                    type="button"
                    @click="showPassword = !showPassword"
                    class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                  </button>
                </div>

                <div v-if="error" class="alert alert-danger border-0 small py-2 mb-3">
                  {{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold py-2 fs-5 mb-3">
                  Đăng nhập
                </button>

                <div class="text-center mb-4">
                  <a href="#" class="text-primary text-decoration-none small">Quên mật khẩu?</a>
                </div>

                <hr class="opacity-10 mb-4">

                <div class="text-center">
                  <router-link to="/register" class="btn btn-success btn-lg fw-bold px-4 py-2 fs-6">
                    Tạo tài khoản mới
                  </router-link>
                </div>
              </form>
            </div>
          </div>
          <div class="text-center mt-4 small">
            <p><a href="#" class="text-dark fw-bold text-decoration-none">Tạo Trang</a> dành cho người nổi tiếng, thương hiệu hoặc doanh nghiệp.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Simple Footer -->
    <div class="footer-simple position-fixed bottom-0 w-100 bg-white py-4 d-none d-md-block">
      <div class="container text-muted x-small">
        <div class="d-flex flex-wrap gap-3 mb-2">
          <span>Tiếng Việt</span> <span>English (UK)</span> <span>中文(台灣)</span> <span>한국어</span> <span>日本語</span> <span>Français (France)</span> <span>ภาษาไทย</span>
        </div>
        <hr class="my-2 opacity-5">
        <div class="d-flex flex-wrap gap-3">
          <span>Đăng ký</span> <span>Đăng nhập</span> <span>Messenger</span> <span>Facebook Lite</span> <span>Video</span> <span>Địa điểm</span> <span>Trò chơi</span> <span>Marketplace</span> <span>Meta Pay</span> <span>Cửa hàng trên Meta</span>
        </div>
        <div class="mt-2">Meta © 2024</div>
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
.bg-fb-gray { background-color: #f0f2f5; }
.text-primary { color: #0866ff !important; }
.btn-primary { background-color: #0866ff; border: none; }
.btn-primary:hover { background-color: #0550d1; }
.btn-success { background-color: #42b72a; border: none; }
.btn-success:hover { background-color: #36a420; }

.fb-logo {
  font-family: Arial, sans-serif;
}

.border-light-gray {
  border: 1px solid #dddfe2;
}
.border-light-gray:focus {
  border-color: #0866ff;
  box-shadow: 0 0 0 2px #e7f3ff;
}

.x-small {
  font-size: 11px;
}

.auth-wrapper {
  background-color: #f0f2f5;
}

@media (max-width: 991px) {
  .fb-login-page {
    padding-bottom: 2rem;
  }
}
</style>
