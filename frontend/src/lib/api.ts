import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('JWT token being sent:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// Questions endpoints
export const getQuestions = (params) => api.get('/questions', { params });
export const getQuestionById = (id) => api.get(`/questions/${id}`);
export const createQuestion = (questionData) => api.post('/questions', questionData);
export const updateQuestion = (id, questionData) => api.put(`/questions/${id}`, questionData);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);

// Answers endpoints
export const getAnswers = (questionId) => api.get(`/questions/${questionId}/answers`);
export const createAnswer = (questionId, answerData) => api.post(`/answers`, { ...answerData, question: questionId });
export const updateAnswer = (id, answerData) => api.put(`/answers/${id}`, answerData);
export const deleteAnswer = (id) => api.delete(`/answers/${id}`);
export const acceptAnswer = (id) => api.put(`/answers/${id}/accept`);

// Votes endpoints
export const voteQuestion = (id, voteType) => api.post(`/votes/question/${id}`, { voteType });
export const voteAnswer = (id, voteType) => api.post(`/votes/answer/${id}`, { voteType });

// Tags endpoints
export const getTags = () => api.get('/tags');

// Notifications endpoints
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');

export default api;