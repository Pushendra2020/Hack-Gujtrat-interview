import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User API calls
export const loginUser = (email, password) => api.post('/users/login', { email, password });
export const registerUser = (name, email, password) => api.post('/users/register', { name, email, password });
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.put('/users/profile', userData);
export const getUserPerformance = () => api.get('/users/performance');

// Interview API calls
export const startInterview = (role, jobDescription) => api.post('/interview/start', { role, jobDescription });
export const submitAnswer = (sessionId, questionIndex, answer, audioUrl) => 
  api.post('/interview/submit-answer', { sessionId, questionIndex, answer, audioUrl });
export const generateFeedback = (sessionId) => api.post('/interview/feedback', { sessionId });
export const getInterviewById = (id) => api.get(`/interview/${id}`);
export const getUserInterviews = () => api.get('/interview');

// Resume API calls
export const uploadResume = (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  console.log(formData);
  console.log(config);
  return api.post('/resume/upload', formData, config);
};
export const getATSScore = (resumeId, role) => api.post('/resume/ats-score', { resumeId, role });
export const getUserResumes = () => api.get('/resume');
export const getResumeById = (id) => api.get(`/resume/${id}`);

// Report API calls
export const generateReport = (interviewId, resumeId) => api.post('/report/pdf', { interviewId, resumeId });
export const getReportByInterviewId = (interviewId) => api.get(`/report/${interviewId}`);

export default api; 