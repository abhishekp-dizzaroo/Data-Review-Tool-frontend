import axios from 'axios';
import { authService } from './user.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface QueryResult {
  subject_id: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql_query?: string;
  data?: QueryResult[];
  rowcount?: number;
  answer?: string;
}

export interface ChatHistory {
  _id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_id: string;
}



export type ModelType = 'sqlCoder' | 'gemini' | 'openAI' | 'rag' | 'langchain' | 'agent' | 'gemini_rag';
const user = authService.getCurrentUser();
const user_id = user?._id;

export const chatService = {
  
  sendQuery: async (prompt: string, model: ModelType): Promise<Message> => {
    console.log(prompt);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/query`, {
        prompt: prompt,
        model: model,
        user_id: user_id
      });
      
      const { data } = response.data;
      
      console.log("SQL LLM RESPONSE" , data);
      
      return {
        role: 'assistant',
        content: data.message,
        sql_query: data.sql_query,
        data: data.data,
        answer: data.answer,  
        rowcount: data.rowcount
      };
    } catch (error) {
      console.error('Error sending query:', error);
      return {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again later."
      };
    }
  },

  // Chat History Functions
  createChatHistory: async (title: string, messages: Message[], user_id: string): Promise<ChatHistory> => {
    try {
      // Log the request data
      console.log('Creating chat history with data:', {
        title,
        messages,
        user_id
      });

      const requestData = {
        title,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          sql_query: msg.sql_query || null,
          data: msg.data || null,
          rowcount: msg.rowcount || null,
          answer: msg.answer || null
        })),
        user_id
      };

      console.log('Sending request with data:', requestData);

      const response = await axios.post(`${API_BASE_URL}/api/chat-history`, requestData);
      console.log('Chat history created:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      console.error('Error creating chat history:', error);
      throw error;
    }
  },

  getUserChatHistories: async (user_id: string): Promise<ChatHistory[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat-history/${user_id}`);
      console.log("response",response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat histories:', error);
      throw error;
    }
  },

  getChatHistory: async (chat_id: string): Promise<ChatHistory> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat-history/single/${chat_id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  updateChatHistory: async (chat_id: string, messages: Message[]): Promise<void> => {
    try {
      const requestData = {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          sql_query: msg.sql_query || null,
          data: msg.data || null,
          rowcount: msg.rowcount || null,
          answer: msg.answer || null
        }))
      };

      await axios.put(`${API_BASE_URL}/api/chat-history/${chat_id}`, requestData);
    } catch (error) {
      console.error('Error updating chat history:', error);
      throw error;
    }
  },

  deleteChatHistory: async (chat_id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/api/chat-history/${chat_id}`);
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  }
};