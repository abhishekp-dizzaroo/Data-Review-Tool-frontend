import axios from 'axios';
import {AuthResponse, LoginCredentials, RegisterData} from '../models/user.model'

// Define the base URL for API requests

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth` : 'http://localhost:8000/api/auth';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// // Add request interceptor to include auth token in headers
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Auth service functions
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/login', credentials);
      
      // Store token in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token.access_token);
      console.log("Login Response", response.data);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific error responses from the API
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Unable to connect to the server');
    }
  },

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/register', userData);
      
      // Store token in localStorage
      // localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log("Register Response", response.data);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Unable to connect to the server');
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current authenticated user
  getCurrentUser(): { _id: string; email: string; username: string } | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      if (!user || !user._id) {
        console.warn('Invalid user data in localStorage');
        return null;
      }
      return user;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
};export default apiClient;

