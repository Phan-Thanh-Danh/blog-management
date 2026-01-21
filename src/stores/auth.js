import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const users = ref([])
  const posts = ref([])
  const comments = ref([])

  // Load dữ liệu từ localStorage khi khởi tạo
  const loadData = () => {
    const savedUsers = localStorage.getItem('users')
    const savedUser = localStorage.getItem('currentUser')
    const savedPosts = localStorage.getItem('posts')
    const savedComments = localStorage.getItem('comments')
    
    if (savedUsers) users.value = JSON.parse(savedUsers)
    if (savedUser) user.value = JSON.parse(savedUser)
    if (savedPosts) posts.value = JSON.parse(savedPosts)
    if (savedComments) comments.value = JSON.parse(savedComments)
  }

  loadData()

  const isAuthenticated = computed(() => user.value !== null)

  // Y2.1 - ĐĂNG KÝ
  const register = (userData) => {
    const existingUser = users.value.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Email đã được sử dụng')
    }

    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      avatar: userData.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name),
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)
    localStorage.setItem('users', JSON.stringify(users.value))
    return newUser
  }

  // Y2.1 - ĐĂNG NHẬP
  const login = (email, password) => {
    const foundUser = users.value.find(
      u => u.email === email && u.password === password
    )

    if (!foundUser) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    user.value = foundUser
    localStorage.setItem('currentUser', JSON.stringify(foundUser))
    return foundUser
  }

  // ĐĂNG XUẤT
  const logout = () => {
    user.value = null
    localStorage.removeItem('currentUser')
  }

  // Y2.2 - TẠO BÀI VIẾT
  const createPost = (postData) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập')

    const newPost = {
      id: Date.now(),
      title: postData.title,
      content: postData.content,
      image: postData.image || '',
      authorId: user.value.id,
      authorName: user.value.name,
      authorAvatar: user.value.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    posts.value.unshift(newPost)
    localStorage.setItem('posts', JSON.stringify(posts.value))
    return newPost
  }

  // Y2.2 - CHỈNH SỬA BÀI VIẾT
  const updatePost = (postId, postData) => {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index === -1) throw new Error('Không tìm thấy bài viết')

    const post = posts.value[index]
    if (post.authorId !== user.value.id) {
      throw new Error('Bạn không có quyền chỉnh sửa bài viết này')
    }

    posts.value[index] = {
      ...post,
      title: postData.title,
      content: postData.content,
      image: postData.image || post.image,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem('posts', JSON.stringify(posts.value))
    return posts.value[index]
  }

  // Y2.2 - XÓA BÀI VIẾT
  const deletePost = (postId) => {
    const post = posts.value.find(p => p.id === postId)
    if (!post) throw new Error('Không tìm thấy bài viết')

    if (post.authorId !== user.value.id) {
      throw new Error('Bạn không có quyền xóa bài viết này')
    }

    posts.value = posts.value.filter(p => p.id !== postId)
    comments.value = comments.value.filter(c => c.postId !== postId)
    
    localStorage.setItem('posts', JSON.stringify(posts.value))
    localStorage.setItem('comments', JSON.stringify(comments.value))
  }

  // Y2.3 - TẠO BÌNH LUẬN
  const createComment = (postId, content) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập')

    const newComment = {
      id: Date.now(),
      postId: postId,
      content: content,
      authorId: user.value.id,
      authorName: user.value.name,
      authorAvatar: user.value.avatar,
      createdAt: new Date().toISOString()
    }

    comments.value.push(newComment)
    localStorage.setItem('comments', JSON.stringify(comments.value))
    return newComment
  }

  // Lấy comments của một bài viết
  const getPostComments = (postId) => {
    return comments.value.filter(c => c.postId === postId)
  }

  // Y2.4 - CẬP NHẬT THÔNG TIN CÁ NHÂN
  const updateProfile = (userData) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập')

    // Cập nhật trong danh sách users
    const userIndex = users.value.findIndex(u => u.id === user.value.id)
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || users.value[userIndex].avatar,
        ...(userData.password && { password: userData.password })
      }

      user.value = users.value[userIndex]
      localStorage.setItem('users', JSON.stringify(users.value))
      localStorage.setItem('currentUser', JSON.stringify(user.value))
    }

    return user.value
  }

  return {
    user,
    users,
    posts,
    comments,
    isAuthenticated,
    register,
    login,
    logout,
    createPost,
    updatePost,
    deletePost,
    createComment,
    getPostComments,
    updateProfile
  }
})