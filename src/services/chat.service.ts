import axios from 'axios';
import { authService } from './user.service';
import axiosInstance from '@/config/axios';

export interface QueryResult extends Record<string, unknown> {
  subject_id: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql_query?: string;
  data?: QueryResult[];
  rowcount?: number;
  answer?: string;
  steps?: string;
}

export interface ChatHistory {
  _id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ShareChatRequest {
  sender_id: string;
  receiver_id: string;
  question: string;
  sql_query?: string;
  result?: QueryResult[];
  message?: string;
  steps?: string;
}

export interface SharedChat {
  share_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  question: string;
  sql_query?: string;
  result?: QueryResult[];
  message?: string;
  steps?: string;
  shared_at: string;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected';
}

export type ModelType = 'sqlCoder' | 'gemini' | 'openAI' | 'rag' | 'langchain' | 'agent' | 'gemini_rag' | 'claude' | 'deepseek_r1';
const user = authService.getCurrentUser();
const user_id = user?._id;

export const chatService = {
  
  sendQuery: async (prompt: string, model: ModelType): Promise<Message> => {
    console.log("FULL_PROMPT",prompt);
    
    try {
      const response = await axiosInstance.post(`/api/ai/query`, {
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

      const response = await axiosInstance.post(`/api/chat-history`, requestData);
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
      const response = await axiosInstance.get(`/api/chat-history/${user_id}`);
      console.log("response",response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat histories:', error);
      throw error;
    }
  },

  getChatHistory: async (chat_id: string): Promise<ChatHistory> => {
    try {
      const response = await axiosInstance.get(`/api/chat-history/single/${chat_id}`);
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

      await axiosInstance.put(`/api/chat-history/${chat_id}`, requestData);
    } catch (error) {
      console.error('Error updating chat history:', error);
      throw error;
    }
  },

  deleteChatHistory: async (chat_id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/chat-history/${chat_id}`);
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  },

  shareChat: async (request: ShareChatRequest): Promise<{ share_id: string; message: string }> => {
    try {
      console.log('Sending share request:', request);
      
      // Ensure all optional fields are properly handled
      const shareRequest = {
        sender_id: request.sender_id,
        receiver_id: request.receiver_id,
        question: request.question,
        sql_query: request.sql_query || null,
        result: request.result || null,
        message: request.message || null,
        steps: request.steps || null
      };
      
      console.log('Processed share request:', shareRequest);
      
      const response = await axiosInstance.post(`/api/chat/share`, shareRequest);
      console.log('Share response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sharing chat:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  getReceivedChats: async (receiver_id: string): Promise<SharedChat[]> => {
    try {
      console.log('Fetching received chats for user:', receiver_id);
      const response = await axiosInstance.get(`/api/chat/received/${receiver_id}`);
      console.log('Received chats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching received chats:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  getSentChats: async (sender_id: string): Promise<SharedChat[]> => {
    try {
      console.log('Fetching sent chats for user:', sender_id);
      const response = await axiosInstance.get(`/api/chat/sent/${sender_id}`);
      console.log('Sent chats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sent chats:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  updateChatStatus: async (share_id: string, user_id: string, new_status: string): Promise<void> => {
    try {
      console.log('Updating chat status:', { share_id, user_id, new_status });
      const response = await axiosInstance.put(`/api/chat/share/${share_id}/status`, {
        user_id,
        new_status
      });
      console.log('Status update response:', response.data);
    } catch (error) {
      console.error('Error updating chat status:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  deleteSharedChat: async (share_id: string, user_id: string): Promise<void> => {
    try {
      console.log('Deleting shared chat:', { share_id, user_id });
      const response = await axiosInstance.delete(`/api/chat/share/${share_id}`, {
        data: { user_id }
      });
      console.log('Delete response:', response.data);
    } catch (error) {
      console.error('Error deleting shared chat:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }

};