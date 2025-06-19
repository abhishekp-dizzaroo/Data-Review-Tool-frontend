import axios from 'axios';
import {AuthResponse, LoginCredentials, RegisterData, Users} from '../models/user.model'
import axiosInstance from "../config/axios"

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log("Login Response", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Unable to connect to the server');
    }
  },

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', userData);
      
      // Store token and user if needed
      // localStorage.setItem('token', response.data.token.access_token);
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

  // Get all users
  async getAllUsers(): Promise<Users[]> {
    try {
      const response = await axiosInstance.get<Users[]>('/api/auth/users');
      console.log("All Users", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users", error);
      throw error;
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current authenticated user
  getCurrentUser(): Users | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr) as Users;
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
};