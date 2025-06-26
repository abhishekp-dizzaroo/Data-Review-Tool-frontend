import axiosInstance from "../config/axios";

export interface FeedbackPayload {
  user_id: string;
  prompt: string;
  sql_query?: string;
  data?: Record<string, unknown>[];
  steps?: string;
  summary?: string;
  feedback: number; // 1 for thumbs up, -1 for thumbs down
  comment?: string;
}

export const feedbackService = {
  async submitFeedback(payload: FeedbackPayload) {
    const response = await axiosInstance.post('/api/feedback', payload);
    return response.data;
  },
  async getFeedback() {
    const response = await axiosInstance.get('/api/feedback');
    console.log("FEEDBACK", response.data);
    
    return response.data;
  }
}; 