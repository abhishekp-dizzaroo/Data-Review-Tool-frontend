import { Home, BarChart2, Layers, Settings, PlusCircle, MessageSquare, Database, List, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useLocation, Link, useNavigate } from 'react-router'
import { StandardQuery } from '../constants/StandardQuery'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { chatService, ChatHistory } from '../services/chat.service'
import { authService } from '../services/user.service'

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  // Add state for toggling Standard Queries directory
  const [showStandardQueries, setShowStandardQueries] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  // Load chat histories
  useEffect(() => {
    const loadChatHistories = async () => {
      const user = authService.getCurrentUser();
      if (user && user._id) {
        try {
          const histories = await chatService.getUserChatHistories(user._id);
          setChatHistories(histories);
        } catch (error) {
          console.error('Error loading chat histories:', error);
        }
      }
    };
    loadChatHistories();
  }, []);


  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChatHistory(chatId);
      // Reload chat histories after deletion
      const user = authService.getCurrentUser();
      if (user && user._id) {
        const histories = await chatService.getUserChatHistories(user._id);
        setChatHistories(histories);
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
    }
  };

  // Function to handle query click
  const handleQueryClick = (query: string) => {
    // Navigate to chat with the new query
    navigate('/chat', { 
      state: { 
        query: query
      }
    });
  };

  const menuItems = [
    {
      icon: <Home size={16} />,
      label: 'Dashboard',
      path: '#'
    },
    {
      icon: <BarChart2 size={16} />,
      label: 'Analytics',
      path: '#'
    },
    {
      icon: <Layers size={16} />,
      label: 'Projects',
      path: '/#'
    },
    {
      icon: <List size={16} />,
      label: 'Tasks',
      path: '/#'
    }
  ];

  return (
    <div className="h-[calc(100vh-4rem)] w-72 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Fixed top section (New Chat button) */}
      <div className="p-3">
        <button
          onClick={() => navigate('/chat', { replace: true })}
          className="w-full flex items-center justify-center gap-2 rounded-md p-3 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-500 dark:border-gray-400 text-gray-700 dark:text-gray-300"
        >
          <PlusCircle size={16} />
          New Chat
        </button>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex-1">
          {/* Recent Chats Section */}
          <div className="mt-4 px-3">
            <div className="text-xs font-medium mb-2 px-2 text-gray-500 dark:text-gray-400">RECENT CHATS</div>
            <ul className="space-y-1">
              {chatHistories.map((chat) => {
                const isActive = currentPath === `/chat/${chat._id}`;

                return (
                  <li key={chat._id} className="group relative flex items-center">
                    <Link
                      to={`/chat/${chat._id}`}
                      className={`flex-1 flex items-center px-2 py-2 text-sm rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <MessageSquare size={15} className={`mr-2 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'}`} />
                      <span className="truncate flex-1">{chat.title}</span>
                      {isActive && <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 ml-2"></div>}
                    </Link>

                    <button 
                      onClick={() => handleDeleteChat(chat._id)}
                      className="absolute right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                    >
                      <Trash2 size={14} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Main Menu Section */}
          <div className="mt-6 px-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 px-2">MAIN MENU</div>
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = currentPath === item.path;

                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-2 py-2 text-sm rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-gray-300 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 ml-auto"></div>}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Standard Queries Directory */}
            <div className="mt-2 text-blue-500 dark:text-blue-400">
              <Collapsible 
                open={showStandardQueries} 
                onOpenChange={setShowStandardQueries}
                className="rounded-md border-none"
              >
                <CollapsibleTrigger className={`flex items-center w-full px-2 py-2 text-sm transition-colors duration-200 ${
                  showStandardQueries ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                  <Database size={16} className={`mr-2 ${showStandardQueries ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className="font-medium">Standard Queries</span>
                  <div className="ml-auto">
                    {showStandardQueries ? 
                      <ChevronDown size={16} className={showStandardQueries ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} /> : 
                      <ChevronRight size={16} />
                    }
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="bg-gray-50 dark:bg-gray-800/50 pt-1 pb-2">
                  {Object.entries(StandardQuery).map(([category, queries]) => (
                    <div key={category} className="mx-2 my-1">
                      <button
                        className="flex items-center w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      >
                        {expandedCategory === category ? 
                          <ChevronDown size={14} className="mr-1" /> : 
                          <ChevronRight size={14} className="mr-1" />
                        }
                        <span className="text-sm font-medium">{category}</span>
                      </button>
                      
                      {expandedCategory === category && (
                        <div className="ml-6 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-2">
                          {queries.length === 0 ? (
                            <p className="italic text-xs text-gray-400 dark:text-gray-500 p-1">No queries</p>
                          ) : (
                            <ul className="space-y-1">
                              {queries.map((query, idx) => (
                                <li 
                                  key={idx}
                                  className="text-xs cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  onClick={() => handleQueryClick(query)}
                                >
                                  {query}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Settings Section */}
          <div className="mt-4 mb-2 px-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 px-2">SETTINGS</div>
            <ul className="space-y-1">
              <li>
                {(() => {
                  const settingsPath = '/settings';
                  const isActive = currentPath === settingsPath;

                  return (
                    <Link
                      to={settingsPath}
                      className={`flex items-center px-2 py-2 text-sm rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Settings size={16} className={`mr-2 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                      <span>Settings</span>
                      {isActive && <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 ml-auto"></div>}
                    </Link>
                  );
                })()}
              </li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Sidebar