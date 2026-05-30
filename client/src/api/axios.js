import axios from 'axios';

const API = axios.create({
  baseURL: 'https://skillsphere-smoky-two.vercel.app/api',
  withCredentials: true,
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  me:       ()     => API.get('/auth/me'),
  logout:   ()     => API.post('/auth/logout'),
};

export const userAPI = {
  getProfile:     ()     => API.get('/users/profile'),
  updateProfile:  (data) => API.put('/users/profile', data),
  getFreelancers: ()     => API.get('/users/freelancers'),
};

export default API;

export const gigAPI = {
  getAll:    (params) => API.get('/gigs', { params }),
  getById:   (id)     => API.get(`/gigs/${id}`),
  create:    (data)   => API.post('/gigs', data),
  update:    (id, data) => API.put(`/gigs/${id}`, data),
  delete:    (id)     => API.delete(`/gigs/${id}`),
  getMy:     ()       => API.get('/gigs/my'),
};

export const proposalAPI = {
  create:    (gigId, data) => API.post(`/proposals/${gigId}`, data),
  getMy:     ()            => API.get('/proposals/my'),
  getGigProposals: (gigId) => API.get(`/proposals/gig/${gigId}`),
  accept:    (id)          => API.put(`/proposals/${id}/accept`),
  reject:    (id)          => API.put(`/proposals/${id}/reject`),
};