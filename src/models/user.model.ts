export interface LoginCredentials {
    email: string;
    password: string;
  }
  
export interface AuthResponse {
    user: {
      id: string;
      username: string;
      email: string;
      created_at: string;
    },
    token: {
      access_token: string;
      token_type: string;
    }
  }
  
export interface RegisterData extends LoginCredentials {
    username: string;
    confirmPassword?: string;
  }


  