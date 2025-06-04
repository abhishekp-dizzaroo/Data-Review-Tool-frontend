import { useState } from 'react'
import { Menu, X, Bell, Search, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react'
import { authService } from "../services/user.service";
import { useTheme } from '../context/ThemeContext';

import { useNavigate } from "react-router";

interface UserData {
  username?: string;
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const user = authService.getCurrentUser() as UserData

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-2 md:ml-0">Analytical<span className="text-gray-800 dark:text-gray-200"> Platform</span></div>
        </div>
        
        <div className="hidden md:flex items-center relative mx-4 flex-1 max-w-md">
          <Search size={18} className="absolute left-3 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <div 
              className="flex items-center cursor-pointer space-x-2 border-l border-gray-200 dark:border-gray-700 pl-3 ml-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.username || 'User'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Admin</div>
              </div>
              <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;