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

/**
 * Translate HTML content or an object with title and content
 * Automatically detects and translates to the opposite language (VN <-> EN)
 */
export const translateHTMLContent = async (data) => {
      if (!data) return null;

      const isObject = typeof data === 'object';
      const promptText = isObject
            ? `Hãy dịch tiêu đề (title) và nội dung HTML sau đây. 
               Nếu nội dung là Tiếng Việt, hãy dịch sang Tiếng Anh. 
               Nếu nội dung là Tiếng Anh, hãy dịch sang Tiếng Việt.
               Trả về kết quả dưới dạng JSON với 3 phím: "title", "content" và "targetLanguage" (giá trị là "Tiếng Anh" hoặc "Tiếng Việt").
               
               Dữ liệu: ${JSON.stringify(data)}`
            : `Hãy dịch nội dung HTML sau đây. 
               Nếu là Tiếng Việt, hãy dịch sang Tiếng Anh. 
               Nếu là Tiếng Anh, hãy dịch sang Tiếng Việt.
               Trả về kết quả dưới dạng JSON với 2 phím: "content" và "targetLanguage".
               
               Nội dung: ${data}`;

      try {
            const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
                  method: 'POST',
                  headers: {
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                        contents: [{
                              parts: [{
                                    text: `${promptText}
                                    
                                    YÊU CẦU QUAN TRỌNG: 
                                    1. GIỮ NGUYÊN HOÀN TOÀN CẤU TRÚC THẺ HTML (ví dụ: <p>, <div>, <img>, <a>, <strong>, v.v.).
                                    2. KHÔNG dịch nội dung bên trong các thuộc tính của thẻ (src, href, style, class).
                                    3. Chỉ dịch phần văn bản hiển thị.
                                    4. TRẢ VỀ DUY NHẤT MỘT KHỐI JSON HỢP LỆ, KHÔNG giải thích gì thêm.`
                              }]
                        }]
                  })
            });

            if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error?.message || 'Lỗi khi gọi Gemini API để dịch');
            }

            const responseData = await response.json();
            let rawResult = responseData.candidates[0].content.parts[0].text.trim();

            // Tìm và tách khối JSON trong trường hợp AI trả về văn bản thừa
            const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                  throw new Error('AI không trả về định dạng JSON hợp lệ');
            }

            const result = JSON.parse(jsonMatch[0]);

            // Xử lý làm sạch content (loại bỏ markdown block nếu AI vẫn cho vào bên trong value)
            if (result.content) {
                  result.content = result.content.replace(/^```html\n?/, '').replace(/\n?```$/, '');
            }

            return result;
      } catch (error) {
            console.error('Gemini Translation Error:', error);
            throw error;
      }
};
