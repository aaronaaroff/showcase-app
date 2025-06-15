import PocketBase from 'pocketbase';

// Use import.meta.env for Vite environment variables
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Enable auto cancellation of pending requests
pb.autoCancellation(false);

// Types for our collections
export interface ChatMessage {
  id?: string;
  content: string;
  sender: 'user' | 'critic';
  timestamp: string;
  personalityId?: string;
  personalityName?: string;
  personalityAvatar?: string;
  personalityColor?: string;
  imageUrl?: string;
  image?: string;  // File field name from PocketBase
  sessionId: string;
}

export interface ChatSession {
  id?: string;
  userId?: string;
  title: string;
  lastMessage?: string;
  created?: string;
  updated?: string;
}

// Helper functions
export const chatService = {
  // Create a new chat session
  async createSession(title: string = 'New Art Critique Session'): Promise<ChatSession> {
    try {
      const session = await pb.collection('chat_sessions').create<ChatSession>({
        title,
        userId: pb.authStore.model?.id || 'anonymous',
      });
      return session;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  },

  // Get all sessions for current user
  async getSessions(): Promise<ChatSession[]> {
    try {
      const sessions = await pb.collection('chat_sessions').getFullList<ChatSession>({
        sort: '-created',
        filter: pb.authStore.model?.id 
          ? `userId = "${pb.authStore.model.id}"` 
          : 'userId = "anonymous"',
      });
      return sessions;
    } catch (error) {
      console.error('Failed to get chat sessions:', error);
      return [];
    }
  },

  // Save a message with optional image file
  async saveMessage(message: Omit<ChatMessage, 'id'>, imageFile?: File): Promise<ChatMessage> {
    try {
      const data: any = { ...message };
      
      // If there's an image file, we'll save it with the message
      if (imageFile) {
        const formData = new FormData();
        
        // Add all message fields to FormData
        Object.entries(message).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add the image file
        formData.append('image', imageFile);
        
        const savedMessage = await pb.collection('chat_messages').create<ChatMessage>(formData);
        return savedMessage;
      } else {
        // No image, just save the message normally
        const savedMessage = await pb.collection('chat_messages').create<ChatMessage>(data);
        return savedMessage;
      }
    } catch (error) {
      console.error('Failed to save message:', error);
      throw error;
    }
  },

  // Get messages for a session
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const messages = await pb.collection('chat_messages').getFullList<ChatMessage>({
        filter: `sessionId = "${sessionId}"`,
        sort: 'timestamp',
      });
      return messages;
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  },

  // Update session's last message
  async updateSessionLastMessage(sessionId: string, lastMessage: string): Promise<void> {
    try {
      await pb.collection('chat_sessions').update(sessionId, { lastMessage });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  },
};