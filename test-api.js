import fetch from 'node-fetch'; // Nếu không có node-fetch có thể dùng fetch mặc định của Node 18+

const API_KEY = 'AIzaSyC02z1Ki_Mk2fcn9-52OBiQevzTzZ88wuI';

async function listModels() {
      try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
      } catch (error) {
            console.error('Error listing models:', error);
      }
}

listModels();
