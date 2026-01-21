<template>
  <div class="container py-5">
    <h1 class="mb-4">Danh sách bài viết</h1>
    
    <div v-if="authStore.posts.length === 0" class="alert alert-info">
      Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
    </div>
    
    <div class="row">
      <div class="col-md-8">
        <PostCard 
          v-for="post in authStore.posts" 
          :key="post.id" 
          :post="post"
          @edit="editPost"
          @delete="deletePost"
        />
      </div>
      
      <div class="col-md-4">
        <div class="card sticky-top" style="top: 80px;">
          <div class="card-body">
            <h5 class="card-title">Về blog này</h5>
            <p class="card-text">Chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị của bạn.</p>
            
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/register" class="btn btn-primary w-100 mb-2">
                Đăng ký ngay
              </router-link>
              <router-link to="/login" class="btn btn-outline-primary w-100">
                Đăng nhập
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal chỉnh sửa bài viết -->
    <div class="modal fade" id="editModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chỉnh sửa bài viết</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePost">
              <div class="mb-3">
                <label class="form-label">Tiêu đề</label>
                <input v-model="editForm.title" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung</label>
                <textarea v-model="editForm.content" class="form-control" rows="5" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Hình ảnh (URL)</label>
                <input v-model="editForm.image" type="url" class="form-control">
              </div>
              <button type="submit" class="btn btn-primary">Cập nhật</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import PostCard from '../components/PostCard.vue'
import { Modal } from 'bootstrap'

const authStore = useAuthStore()

const editForm = ref({
  id: null,
  title: '',
  content: '',
  image: ''
})

let editModal = null

const editPost = (post) => {
  editForm.value = {
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image
  }
  
  if (!editModal) {
    editModal = new Modal(document.getElementById('editModal'))
  }
  editModal.show()
}

const updatePost = () => {
  try {
    authStore.updatePost(editForm.value.id, editForm.value)
    editModal.hide()
    alert('Cập nhật bài viết thành công!')
  } catch (error) {
    alert(error.message)
  }
}

const deletePost = (postId) => {
  try {
    authStore.deletePost(postId)
    alert('Xóa bài viết thành công!')
  } catch (error) {
    alert(error.message)
  }
}
</script>