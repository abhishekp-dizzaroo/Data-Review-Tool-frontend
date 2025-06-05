import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chatService, ShareChatRequest, QueryResult } from '@/services/chat.service';
import { authService } from '@/services/user.service';
import { Users } from '@/models/user.model';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    content: string;
    sql_query?: string;
    data?: QueryResult[];
    answer?: string;
    steps?: string;
  };
}

export function ShareDialog({ isOpen, onClose, message }: ShareDialogProps) {
  const [users, setUsers] = useState<Users[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        console.log('Fetching users...');
        const allUsers = await authService.getAllUsers();
        console.log('Fetched users:', allUsers);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to share with');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      // Find the AI's response message that follows this user message
      const shareRequest: ShareChatRequest = {
        sender_id: currentUser._id,
        receiver_id: selectedUser,
        question: message.content,
        sql_query: message.sql_query,
        result: message.data,
        message: message.answer,
        steps: message.steps 
      };

      console.log('Sharing chat with request:', shareRequest);
      await chatService.shareChat(shareRequest);
      toast.success('Chat shared successfully');
      onClose();
    } catch (error) {
      console.error('Error sharing chat:', error);
      toast.error('Failed to share chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger disabled={isLoadingUsers}>
              <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user to share with"} />
            </SelectTrigger>
            <SelectContent>
              {users.length === 0 ? (
                <SelectItem value="no-users" disabled>
                  {isLoadingUsers ? "Loading users..." : "No users available"}
                </SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.username}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading || !selectedUser}>
            {isLoading ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 