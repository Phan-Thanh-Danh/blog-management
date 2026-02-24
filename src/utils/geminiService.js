/**
 * Service to interact with Google Gemini AI
 */

const API_KEY = 'AIzaSyC02z1Ki_Mk2fcn9-52OBiQevzTzZ88wuI'; // Cần thay thế bằng key thực tế
const BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

export const generateSummary = async (content) => {
      if (!content) return '';

      // Xóa các thẻ HTML để lấy văn bản thuần túy
      const plainText = content.replace(/<[^>]*>?/gm, '');

      if (plainText.length < 50) return ''; // Không cần tóm tắt nếu quá ngắn

      try {
            const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
                  method: 'POST',
                  headers: {
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                        contents: [{
                              parts: [{
                                    text: `Hãy tóm tắt bài viết sau đây trong khoảng 1-2 câu ngắn gọn, súc tích để thu hút người đọc. Chỉ trả về nội dung tóm tắt, không thêm bất kỳ văn bản nào khác: \n\n${plainText}`
                              }]
                        }]
                  })
            });

            if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error?.message || 'Lỗi khi gọi Gemini API');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
      } catch (error) {
            console.error('Gemini Summarization Error:', error);
            throw error;
      }
};

