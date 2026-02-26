/**
 * Tiện ích nén ảnh để tiết kiệm bộ nhớ localStorage
 */

/**
 * Nén ảnh base64/URL về độ phân giải và chất lượng thấp hơn
 * @param {string} base64Str - Chuỗi base64 của ảnh
 * @param {number} maxWidth - Chiều rộng tối đa (mặc định 800px)
 * @param {number} maxHeight - Chiều cao tối đa (mặc định 800px)
 * @param {number} quality - Chất lượng ảnh (0.1 - 1.0, mặc định 0.7)
 * @returns {Promise<string>} - Chuỗi base64 đã nén
 */
export const compressImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
      return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = base64Str
            img.onload = () => {
                  const canvas = document.createElement('canvas')
                  let width = img.width
                  let height = img.height

                  // Tính toán tỷ lệ để giữ nguyên aspect ratio
                  if (width > height) {
                        if (width > maxWidth) {
                              height *= maxWidth / width
                              width = maxWidth
                        }
                  } else {
                        if (height > maxHeight) {
                              width *= maxHeight / height
                              height = maxHeight
                        }
                  }

                  canvas.width = width
                  canvas.height = height

                  const ctx = canvas.getContext('2d')
                  ctx.drawImage(img, 0, 0, width, height)

                  // Chuyển sang chuỗi base64 (sử dụng format jpeg để nén tốt nhất)
                  const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
                  resolve(compressedBase64)
            }
            img.onerror = () => reject(new Error('Không thể tải ảnh để nén.'))
      })
}

/**
 * Kiểm tra dung lượng ước tính của một chuỗi
 * @param {string} str 
 * @returns {number} - Dung lượng tính bằng MB
 */
export const getStorageSizeMB = (str) => {
      return (encodeURI(str).split(/%..|./).length - 1) / (1024 * 1024)
}
