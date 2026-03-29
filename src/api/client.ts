import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000/api/v1';

// Google Vision API direct call
const GOOGLE_VISION_API_KEY = 'AIzaSyC9yFMn5m826yEsnCoFlflYCVKOuryArIw';

export async function analyzeImageWithVisionAPI(imageBuffer: Buffer): Promise<any> {
  const base64Image = imageBuffer.toString('base64');
  
  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
    {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'FACE_DETECTION',
              maxResults: 10,
            },
            {
              type: 'LABEL_DETECTION',
              maxResults: 10,
            },
          ],
        },
      ],
    }
  );

  return response.data;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { token } = response.data;
          localStorage.setItem('authToken', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = `Rate limited. Please try again in ${retryAfter || '60'} seconds.`;
      return Promise.reject(new Error(message));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

export default client;
