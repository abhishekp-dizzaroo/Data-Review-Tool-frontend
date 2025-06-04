import './App.css'
import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage'
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

import { authService } from "./services/user.service"
import StandardQueryPage from './pages/StandardQueryPage';
import { ThemeProvider } from './context/ThemeContext';


interface AuthProviderProps {
  children: ReactNode;
}

// Protected Route component
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />}/>
            {/* <Route path="/" element={<MainPage />} /> */}


            {/* Private Routes */}
            <Route
              path="/"
              element={<AuthProvider><MainPage/></AuthProvider>}
            >
                <Route index element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage/>} />
                <Route path="/chat/:chatId" element={<ChatPage/>} />
                <Route path="/standard-queries" element={<StandardQueryPage/>} />
                {/* <Route path="/task" element={<h1>Task Page</h1>} /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App


