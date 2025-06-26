import React, { useState, useEffect, useRef } from 'react'
import { Send, Database, Bot, User, Share2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLocation, useNavigate, useParams } from 'react-router'
import { authService } from '../services/user.service'
import { Message, chatService, ModelType } from '../services/chat.service'
import { ShareDialog } from '@/components/ShareDialog'
import { feedbackService, FeedbackPayload } from '../services/feedback.service'

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini');
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<{ message: Message, index: number } | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Reset state on mount or when navigating to new chat
  useEffect(() => {
    if (!chatId) {
      hasInitialized.current = true;
      setCurrentChatId(null);
      setConversations([]); // Clear conversations when starting new chat
    }
  }, [chatId]);

  // Load chat history if chatId is provided
  useEffect(() => {
    const loadChatHistory = async () => {
      if (chatId) {
        try {
          const chatHistory = await chatService.getChatHistory(chatId);
          setConversations(chatHistory.messages);
          setCurrentChatId(chatId);
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    };
    loadChatHistory();
  }, [chatId]);

  // Handle query from navigation
  useEffect(() => {
    const query = location.state?.query;
    const context = location.state?.context;
    if (query) {
      // Clear the state after reading it
      navigate(location.pathname, { replace: true, state: {} });
      setInputMessage(query);
      
      sendQuery(query, context);
    }
  }, [location.state]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to send query to backend
  const sendQuery = async (query: string, context: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setInputMessage(""); // Clear input immediately
    
    try {
      // Add user message to conversation
      const userMessage: Message = {
        role: "user",
        content: query
      };
      
      const updatedConversations = [...conversations, userMessage];
      setConversations(updatedConversations);
      let full_prompt = `Question : ${query}`
      if (context && context.trim() !== '') {
        full_prompt += `\nContext: ${context}`;
      }
     
      const response = await chatService.sendQuery(full_prompt, selectedModel);
      const finalConversations = [...updatedConversations, response];
      setConversations(finalConversations);

      // Save or update chat history
      const user = authService.getCurrentUser();
      if (!user || !user._id) {
        console.warn('No authenticated user found or invalid user data. Chat history will not be saved.');
        return;
      }

      try {
        if (currentChatId) {
          // Update existing chat
          await chatService.updateChatHistory(currentChatId, finalConversations);
        } else {
          // Create new chat
          const chatHistory = await chatService.createChatHistory(
            query.slice(0, 30) + (query.length > 30 ? '...' : ''), // Use first 30 chars as title
            finalConversations,
            user._id
          );
          setCurrentChatId(chatHistory._id);
          navigate(`/chat/${chatHistory._id}`);
        }
      } catch (error) {
        console.error('Error saving chat history:', error);
        // Continue with the conversation even if saving fails
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      setConversations(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user message submission
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || isLoading) return;
    
    const userMessage = inputMessage.trim();
    sendQuery(userMessage, "");
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleShareClick = (message: Message, index: number) => {
    // If this is a user message, find the next message (AI's response)
    if (message.role === 'user' && index < conversations.length - 1) {
      const aiResponse = conversations[index + 1];
      if (aiResponse.role === 'assistant') {
        setSelectedMessage({
          role: 'assistant',
          content: message.content,
          sql_query: aiResponse.sql_query,
          data: aiResponse.data,
          answer: aiResponse.answer,
          steps: aiResponse.content
        });
        setShareDialogOpen(true);
      }
    }
  };

  const handleFeedback = async (message: Message, index: number, feedback: number) => {
    const user = authService.getCurrentUser();
    if (!user || !user._id) return;
    if (feedback === -1) {
      setFeedbackTarget({ message, index });
      setFeedbackDialogOpen(true);
    } else {
      // Thumbs up, send immediately
      const userMsg = conversations[index - 1];
      const payload: FeedbackPayload = {
        user_id: user._id,
        prompt: userMsg?.content || '',
        sql_query: message.sql_query,
        data: message.data,
        steps: message.content,
        summary: message.answer,
        feedback: 1,
      };
      setFeedbackLoading(true);
      try {
        await feedbackService.submitFeedback(payload);
        setFeedbackSuccess(true);
        setTimeout(() => setFeedbackSuccess(false), 2000);
      } catch {
        // Optionally handle error
      } finally {
        setFeedbackLoading(false);
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackTarget) return;
    const user = authService.getCurrentUser();
    if (!user || !user._id) return;
    const { message, index } = feedbackTarget;
    const userMsg = conversations[index - 1];
    const payload: FeedbackPayload = {
      user_id: user._id,
      prompt: userMsg?.content || '',
      sql_query: message.sql_query,
      data: message.data,
      steps: message.content,
      summary: message.answer,
      feedback: -1,
      comment: feedbackComment,
    };
    setFeedbackLoading(true);
    try {
      await feedbackService.submitFeedback(payload);
      setFeedbackSuccess(true);
      setFeedbackDialogOpen(false);
      setFeedbackComment('');
      setTimeout(() => setFeedbackSuccess(false), 2000);
    } catch {
      // Optionally handle error
    } finally {
      setFeedbackLoading(false);
    }
  };

  const renderMessageContent = (message: Message, index: number) => {
    if (message.role === 'user') {
      return (
        <div className="flex items-center justify-between group">
          <p className="text-sm">{message.content}</p>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleShareClick(message, index)}
          >
            <Share2 size={16} />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4 group relative">
       
        {/* Feedback UI */}
        <div className="absolute right-0 top-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            className="hover:text-green-600"
            title="Thumbs Up"
            disabled={feedbackLoading}
            onClick={() => handleFeedback(message, index, 1)}
          >
            <ThumbsUp size={18} />
          </button>
          <button
            className="hover:text-red-600"
            title="Thumbs Down"
            disabled={feedbackLoading}
            onClick={() => handleFeedback(message, index, -1)}
          >
            <ThumbsDown size={18} />
          </button>
        </div>


        {message.sql_query && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <Database size={16} />
              <span>SQL Query</span>
            </div>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-2 rounded">
              {message.sql_query}
            </pre>
          </div>
        )}

        {message.content && (
          <div className="bg-muted rounded-lg p-0">
            <div className="flex items-center space-x-2 text-lg text-muted-foreground mb-2">
              <span>Step To get SQL Query : </span>
            </div>
            <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
          </div>
        )}


        {message.data && message.data.length > 0 && (
          <div className="overflow-x-auto">
            <span className="text-lg text-muted-foreground mb-2">Result : </span>
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  {Object.keys(message.data[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {message.data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {message.rowcount && (
              <p className="text-sm text-muted-foreground mb-2">
                Returned {message.rowcount} rows
              </p>
            )}

          </div>
        )}
        
        

        {message.answer && (
          <div className="bg-muted rounded-lg p-0">
            <div className="flex items-center space-x-2 text-lg text-muted-foreground mb-2">
              <span>Insights : </span>
            </div>
            <Markdown remarkPlugins={[remarkGfm]}>{message.answer}</Markdown>
          </div>
        )}
        
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">      
      {/* Conversation Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 mx-auto max-w-6xl">
            {conversations.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex gap-3 mb-6",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              > 
                <Avatar className="size-8">
                  {message.role === "user" ? (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User size={16} />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <Bot size={16} />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className={cn(
                  "rounded-lg px-4 py-3 max-w-[80%]",
                  message.role === "assistant" 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {renderMessageContent(message, index)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-6">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Select
              value={selectedModel}
              onValueChange={(value: string) => setSelectedModel(value as ModelType)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sqlCoder">SQL Coder</SelectItem>
                <SelectItem value="openAI">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="deepseek_r1">DeepSeek-R1</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="gemini_rag">Gemini RAG</SelectItem>
                <SelectItem value="langchain">Langchain</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="rag">RAG</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="flex-1"
              placeholder="Enter your SQL query request..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
      
      {selectedMessage && (
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setSelectedMessage(null);
          }}
          message={selectedMessage}
        />
      )}

      {/* Feedback Dialog */}
      {feedbackDialogOpen && feedbackTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">We appreciate your feedback!</h2>
            <p className="mb-2">Please let us know what went wrong or how we can improve:</p>
            <textarea
              className="w-full border rounded p-2 mb-4 text-black dark:text-white"
              rows={4}
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="Add your comment..."
              disabled={feedbackLoading}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setFeedbackDialogOpen(false); setFeedbackComment(''); }} disabled={feedbackLoading}>Cancel</Button>
              <Button onClick={handleFeedbackSubmit} disabled={feedbackLoading || !feedbackComment.trim()}>
                {feedbackLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {feedbackSuccess && (
        <div className="fixed bottom-4 right-4 rounded-md h-9 bg-green-800 text-xs font-medium transition-colors text-white active:bg-white focus:bg-white focus:outline-none px-4 py-2 shadow-lg z-50">
          Thank you for your feedback!
        </div>
      )}
    </div>
  )
}

export default ChatPage