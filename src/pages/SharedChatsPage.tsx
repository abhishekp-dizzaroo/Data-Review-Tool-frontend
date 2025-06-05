import { useState, useEffect } from 'react';
import { chatService, SharedChat } from '../services/chat.service';
import { authService } from '../services/user.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function SharedChatsPage() {
  const [receivedChats, setReceivedChats] = useState<SharedChat[]>([]);
  const [sentChats, setSentChats] = useState<SharedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user?._id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    loadChats();
  }, [user?._id]);

  const loadChats = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading chats for user:', user._id);
      const [received, sent] = await Promise.all([
        chatService.getReceivedChats(user._id),
        chatService.getSentChats(user._id)
      ]);
      
      console.log('Received chats:', received);
      console.log('Sent chats:', sent);
      
      // Log each chat's user details
      received.forEach(chat => {
        console.log('Received chat user details:', {
          share_id: chat.share_id,
          sender_id: chat.sender_id,
          sender_name: chat.sender_name,
          receiver_id: chat.receiver_id,
          receiver_name: chat.receiver_name
        });
      });
      
      sent.forEach(chat => {
        console.log('Sent chat user details:', {
          share_id: chat.share_id,
          sender_id: chat.sender_id,
          sender_name: chat.sender_name,
          receiver_id: chat.receiver_id,
          receiver_name: chat.receiver_name
        });
      });
      
      setReceivedChats(received);
      setSentChats(sent);
    } catch (error) {
      console.error('Error loading shared chats:', error);
      setError('Failed to load shared chats. Please try again.');
      toast.error('Failed to load shared chats');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (shareId: string, newStatus: string) => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      await chatService.updateChatStatus(shareId, user._id, newStatus);
      toast.success(`Chat ${newStatus} successfully`);
      await loadChats(); // Reload chats after status update
    } catch (error) {
      console.error('Error updating chat status:', error);
      toast.error('Failed to update chat status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shareId: string) => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      await chatService.deleteSharedChat(shareId, user._id);
      toast.success('Chat deleted successfully');
      await loadChats(); // Reload chats after deletion
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    } finally {
      setLoading(false);
    }
  };

  const renderChatContent = (chat: SharedChat) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">Question:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{chat.question}</p>
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0">
          {new Date(chat.shared_at).toLocaleString()}
        </div>
      </div>

      {chat.sql_query && (
        <div>
          <h3 className="font-semibold mb-2">SQL Query:</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-hidden">
            <pre className="text-sm whitespace-pre-wrap break-all">
              {chat.sql_query}
            </pre>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Steps to Reach SQL Query:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{chat.steps}</p>
      </div>
      
      {chat.result && chat.result.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Results:</h3>
          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {Object.keys(chat.result[0]).map((key) => (
                      <th key={key} className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {chat.result.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 break-words max-w-xs">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {chat.message && (
        <div>
          <h3 className="font-semibold mb-2">Message:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{chat.message}</p>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">{error}</h2>
          <Button onClick={loadChats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col">
      <div className="flex justify-end mb-6">
        <Button 
          onClick={loadChats} 
          variant="outline" 
          disabled={loading} 
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="received" className="w-full flex-1 flex flex-col">
        <TabsList className="mb-6 w-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger 
            value="received" 
            className="px-4 py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Received
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="px-4 py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-0 flex-1">
          <div className="h-[calc(100vh-12rem)] overflow-y-auto pb-8">
            <div className="space-y-4 pr-2">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading chats...</p>
                </div>
              ) : receivedChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No received chats
                </div>
              ) : (
                receivedChats.map((chat) => (
                  <Card key={chat.share_id} className="w-full mb-4">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium break-words">
                        From: {chat.sender_name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        {chat.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(chat.share_id, 'accepted')}
                              disabled={loading}
                              className="text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(chat.share_id, 'rejected')}
                              disabled={loading}
                              className="text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          chat.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          chat.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {chat.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                      {renderChatContent(chat)}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sent" className="mt-0 flex-1">
          <div className="h-[calc(100vh-16rem)] overflow-y-auto pb-8">
            <div className="space-y-4 pr-2">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading chats...</p>
                </div>
              ) : sentChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sent chats
                </div>
              ) : (
                sentChats.map((chat) => (
                  <Card key={chat.share_id} className="w-full mb-4">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium break-words">
                        To: {chat.receiver_name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(chat.share_id)}
                          disabled={loading}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          chat.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          chat.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {chat.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                      {renderChatContent(chat)}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SharedChatsPage;