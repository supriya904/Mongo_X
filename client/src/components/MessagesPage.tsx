import { useState } from 'react';
import type { User } from '../types';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}

const MessagesPage = () => {
  const currentUserId = '1'; // This would come from auth context in a real app

  // Sample users data
  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Alex Johnson',
      username: 'alexj',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      username: 'sarahw',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    {
      id: '5',
      name: 'Mike Brown',
      username: 'mikeb',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
  ];

  // Sample conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv1',
      participants: [users[0], users[1]],
      lastMessage: {
        id: 'msg1',
        senderId: '2',
        receiverId: '1',
        text: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
      },
      unreadCount: 1,
    },
    {
      id: 'conv2',
      participants: [users[0], users[2]],
      lastMessage: {
        id: 'msg2',
        senderId: '1',
        receiverId: '3',
        text: 'Did you see the latest update?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: 'conv3',
      participants: [users[0], users[3]],
      lastMessage: {
        id: 'msg3',
        senderId: '4',
        receiverId: '1',
        text: 'Thanks for the help yesterday!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: 'conv4',
      participants: [users[0], users[4]],
      lastMessage: {
        id: 'msg4',
        senderId: '5',
        receiverId: '1',
        text: 'Are we still meeting tomorrow?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
      },
      unreadCount: 0,
    },
  ]);

  // Sample messages for the selected conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1-1',
      senderId: '1',
      receiverId: '2',
      text: 'Hi Jane, how are you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true,
    },
    {
      id: 'msg1-2',
      senderId: '2',
      receiverId: '1',
      text: 'I\'m good, thanks for asking! How about you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      read: true,
    },
    {
      id: 'msg1-3',
      senderId: '1',
      receiverId: '2',
      text: 'Doing well! Just working on this Twitter clone project.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      read: true,
    },
    {
      id: 'msg1-4',
      senderId: '2',
      receiverId: '1',
      text: 'That sounds interesting! How\'s it going so far?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: true,
    },
    {
      id: 'msg1-5',
      senderId: '1',
      receiverId: '2',
      text: 'It\'s coming along nicely. Just finished the notifications page and now working on messages.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: true,
    },
    {
      id: 'msg1-6',
      senderId: '2',
      receiverId: '1',
      text: 'Hey, how are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(user => user.id !== currentUserId) || conversation.participants[0];
  };

  const handleSelectConversation = (conversation: Conversation) => {
    // Mark conversation as read when selected
    if (conversation.unreadCount > 0) {
      setConversations(conversations.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, read: true } } 
          : conv
      ));
      
      // Also mark messages as read
      setMessages(messages.map(msg => 
        msg.senderId !== currentUserId ? { ...msg, read: true } : msg
      ));
    }
    
    setSelectedConversation(conversation);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUser = getOtherParticipant(selectedConversation);
    
    // Create new message
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      receiverId: otherUser.id,
      text: newMessage,
      timestamp: new Date(),
      read: false,
    };
    
    // Add to messages
    setMessages([...messages, newMsg]);
    
    // Update conversation with last message
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: newMsg } 
        : conv
    ));
    
    // Clear input
    setNewMessage('');
  };

  return (
    <div className="min-h-screen border-l border-r border-gray-800 flex">
      {/* Conversations list */}
      <div className="w-1/3 border-r border-gray-800">
        <header className="sticky top-0 z-10 bg-black backdrop-blur-md border-b border-gray-800">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-white">Messages</h1>
          </div>
        </header>
        
        <div className="divide-y divide-gray-800">
          {conversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation);
            return (
              <button 
                key={conversation.id}
                className={`w-full text-left p-4 hover:bg-gray-900 flex items-start space-x-3 ${selectedConversation?.id === conversation.id ? 'bg-gray-900' : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <img 
                  src={otherUser.avatar} 
                  alt={otherUser.name} 
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate text-white">{otherUser.name}</h3>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-semibold text-white' : 'text-gray-400'}`}>
                      {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.text}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Messages view */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <header className="sticky top-0 z-10 bg-black backdrop-blur-md border-b border-gray-800 p-3 flex items-center space-x-3">
              <img 
                src={getOtherParticipant(selectedConversation).avatar} 
                alt={getOtherParticipant(selectedConversation).name} 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-white">{getOtherParticipant(selectedConversation).name}</h2>
                <p className="text-xs text-gray-400">@{getOtherParticipant(selectedConversation).username}</p>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${message.senderId === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}
                  >
                    <p>{message.text}</p>
                    <div className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                      {formatTimestamp(message.timestamp)}
                      {message.senderId === currentUserId && (
                        <span className="ml-2">
                          {message.read ? 'Read' : 'Delivered'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-800 p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Start a new message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
