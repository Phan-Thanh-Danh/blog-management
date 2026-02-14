import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const users = ref([])
  const posts = ref([])
  const comments = ref([])
  const likes = ref([])
  const categories = ref([
    'Công nghệ',
    'Review',
    'Học tập',
    'Đời sống',
    'Giải trí'
  ])

  // Helper bóc tách Hashtag từ HTML content
  const extractHashtags = (html) => {
    if (!html) return []
    // Xóa hết HTML tags để tránh bắt hashtag bên trong thuộc tính tag
    const text = html.replace(/<[^>]*>?/gm, '')
    // Tìm các từ bắt đầu bằng dấu #
    const hashtags = text.match(/#[\w\u00C0-\u1EF9]+/g) || []
    return [...new Set(hashtags)] // Bỏ trùng lặp
  }

  // Lấy danh sách Hashtag thịnh hành (Top 10)
  const trendingTags = computed(() => {
    const tagCount = {}
    posts.value.forEach(post => {
      const tags = post.tags || []
      tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0])
  })

  // Load dữ liệu từ localStorage khi khởi tạo
  const loadData = () => {
    const savedUsers = localStorage.getItem('users')
    const savedUser = localStorage.getItem('currentUser')
    const savedPosts = localStorage.getItem('posts')
    const savedComments = localStorage.getItem('comments')
    const savedLikes = localStorage.getItem('likes')

    if (savedUsers) users.value = JSON.parse(savedUsers)
    if (savedUser) user.value = JSON.parse(savedUser)
    if (savedLikes) likes.value = JSON.parse(savedLikes)

    // Lọc bỏ các bài viết không hợp lệ
    if (savedPosts) {
      const allPosts = JSON.parse(savedPosts)
      posts.value = allPosts.filter(post =>
        post.authorId &&
        post.title &&
        post.content &&
        post.createdAt
      )
      localStorage.setItem('posts', JSON.stringify(posts.value))
    }

    // Lọc bỏ các comments không hợp lệ
    if (savedComments) {
      const allComments = JSON.parse(savedComments)
      comments.value = allComments.filter(comment =>
        comment.authorId &&
        comment.content
      )
      localStorage.setItem('comments', JSON.stringify(comments.value))
    }
  }

  // Hàm lưu an toàn có bắt lỗi QuotaExceeded
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        alert('LỖI: Bộ nhớ trình duyệt đã đầy! Bạn cần xóa bớt bài viết cũ hoặc ảnh để tiếp tục.')
      }
      throw e
    }
  }

  loadData()

  const isAuthenticated = computed(() => user.value !== null)

  // ĐĂNG KÝ
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
      following: [], // THÊM: Danh sách ID người dùng đang theo dõi
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)
    localStorage.setItem('users', JSON.stringify(users.value))
    return newUser
  }

  // ĐĂNG NHẬP
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

  // TẠO BÀI VIẾT
  const createPost = (postData) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập')

    // Handle images array
    const images = postData.images || []
    if (postData.image && images.length === 0) {
      images.push(postData.image)
    }

    const newPost = {
      id: Date.now(),
      title: postData.title,
      content: postData.content,
      images: images,
      image: images.length > 0 ? images[0] : '', // Backward compatibility
      category: postData.category || 'Chung',
      tags: extractHashtags(postData.content),
      authorId: user.value.id,
      authorName: user.value.name,
      authorAvatar: user.value.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    posts.value.unshift(newPost)
    saveToStorage('posts', posts.value)
    return newPost
  }

  // CHỈNH SỬA BÀI VIẾT
  const updatePost = (postId, postData) => {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index === -1) throw new Error('Không tìm thấy bài viết')

    const post = posts.value[index]
    if (post.authorId !== user.value.id) {
      throw new Error('Bạn không có quyền chỉnh sửa bài viết này')
    }

    // Handle images update
    let updatedImages = postData.images
    if (!updatedImages && postData.image) {
      // If only image is passed (legacy update), wrap it
      updatedImages = [postData.image]
    }
    // If no new images provided, keep old ones? Or replace? 
    // Usually update sends the full state. If postData.images is provided, use it.
    // If not, we might be in a legacy view that only sends .image or we assume no change if not provided.
    // For now, let's assume postData will contain the authoritative list of images if it's a new style edit.

    // safe fallback
    const finalImages = updatedImages !== undefined ? updatedImages : (post.images || (post.image ? [post.image] : []))

    posts.value[index] = {
      ...post,
      title: postData.title,
      content: postData.content,
      images: finalImages,
      image: finalImages.length > 0 ? finalImages[0] : '',
      category: postData.category || post.category || 'Chung',
      tags: extractHashtags(postData.content),
      updatedAt: new Date().toISOString()
    }

    saveToStorage('posts', posts.value)
    return posts.value[index]
  }

  // XÓA BÀI VIẾT
  const deletePost = (postId) => {
    const post = posts.value.find(p => p.id === postId)

    if (!post) {
      throw new Error('Không tìm thấy bài viết')
    }

    if (!user.value) {
      throw new Error('Bạn cần đăng nhập để xóa bài viết')
    }

    if (post.authorId && post.authorId !== user.value.id) {
      throw new Error('Bạn không có quyền xóa bài viết này')
    }

    posts.value = posts.value.filter(p => p.id !== postId)
    comments.value = comments.value.filter(c => c.postId !== postId)
    likes.value = likes.value.filter(l => l.postId !== postId)

    localStorage.setItem('posts', JSON.stringify(posts.value))
    localStorage.setItem('comments', JSON.stringify(comments.value))
    localStorage.setItem('likes', JSON.stringify(likes.value))
  }

  // TẠO BÌNH LUẬN
  const createComment = (postId, content, parentId = null) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập')

    const newComment = {
      id: Date.now(),
      postId: postId,
      content: content,
      parentId: parentId, // null nếu là comment gốc, có giá trị nếu là reply
      authorId: user.value.id,
      authorName: user.value.name,
      authorAvatar: user.value.avatar,
      createdAt: new Date().toISOString()
    }

    comments.value.push(newComment)
    localStorage.setItem('comments', JSON.stringify(comments.value))
    return newComment
  }

  // LẤY COMMENTS CỦA BÀI VIẾT (chỉ comments gốc)
  const getPostComments = (postId) => {
    return comments.value.filter(c => c.postId === postId && !c.parentId)
  }

  // LẤY REPLIES CỦA MỘT COMMENT
  const getCommentReplies = (commentId) => {
    return comments.value.filter(c => c.parentId === commentId)
  }

  // TOGGLE LIKE BÀI VIẾT
  const toggleLike = (postId) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập để thích bài viết')

    const existingLike = likes.value.find(
      l => l.postId === postId && l.userId === user.value.id
    )

    if (existingLike) {
      // Unlike
      likes.value = likes.value.filter(
        l => !(l.postId === postId && l.userId === user.value.id)
      )
    } else {
      // Like
      likes.value.push({
        id: Date.now(),
        postId: postId,
        userId: user.value.id,
        createdAt: new Date().toISOString()
      })
    }

    localStorage.setItem('likes', JSON.stringify(likes.value))
  }

  // KIỂM TRA ĐÃ LIKE BÀI VIẾT CHƯA
  const isPostLiked = (postId) => {
    if (!user.value) return false
    return likes.value.some(
      l => l.postId === postId && l.userId === user.value.id
    )
  }

  // ĐÊM SỐ LIKE CỦA BÀI VIẾT
  const getPostLikesCount = (postId) => {
    return likes.value.filter(l => l.postId === postId).length
  }

  // CẬP NHẬT THÔNG TIN CÁ NHÂN
  const updateProfile = (userData) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập')

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

  // TOGGLE FOLLOW NGƯỜI DÙNG
  const toggleFollow = (authorId) => {
    if (!user.value) throw new Error('Bạn cần đăng nhập để theo dõi')
    if (user.value.id === authorId) throw new Error('Bạn không thể theo dõi chính mình')

    if (!user.value.following) user.value.following = []

    const index = user.value.following.indexOf(authorId)
    if (index === -1) {
      user.value.following.push(authorId)
    } else {
      user.value.following.splice(index, 1)
    }

    // Cập nhật lại list users tổng để đồng bộ
    const userIndex = users.value.findIndex(u => u.id === user.value.id)
    if (userIndex !== -1) {
      users.value[userIndex].following = user.value.following
    }

    localStorage.setItem('users', JSON.stringify(users.value))
    localStorage.setItem('currentUser', JSON.stringify(user.value))
  }

  const isFollowing = (authorId) => {
    if (!user.value || !user.value.following) return false
    return user.value.following.includes(authorId)
  }

  // LẤY DANH SÁCH NGƯỜI DÙNG ĐANG THEO DÕI
  const getFollowingUsers = (userId) => {
    const targetUser = users.value.find(u => u.id === userId)
    if (!targetUser || !targetUser.following) return []
    return users.value.filter(u => targetUser.following.includes(u.id))
  }

  // LẤY DANH SÁCH NGƯỜI THEO DÕI (FOLLOWERS)
  const getFollowersUsers = (userId) => {
    return users.value.filter(u => u.following && u.following.includes(userId))
  }

  return {
    user,
    users,
    posts,
    comments,
    likes,
    categories,
    isAuthenticated,
    register,
    login,
    logout,
    createPost,
    updatePost,
    deletePost,
    createComment,
    getPostComments,
    getCommentReplies,
    toggleLike,
    isPostLiked,
    getPostLikesCount,
    updateProfile,
    toggleFollow,
    toggleFollow,
    isFollowing,
    getFollowingUsers,
    getFollowersUsers,
    extractHashtags,
    trendingTags
  }
})