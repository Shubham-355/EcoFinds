import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import Chatbot from './Chatbot';
import { useAuth } from '../context/AuthContext';

const ChatbotButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();

  // Only show chatbot for authenticated users
  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40"
        aria-label="Open chatbot"
      >
        <Bot size={24} />
      </button>

      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default ChatbotButton;
