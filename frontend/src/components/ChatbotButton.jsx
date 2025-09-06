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
        className=" brutal-btn brutal-btn-primary rounded-brutal fixed bottom-6 right-6 bg-primary hover:bg-secondary text-black p-3 border-3   shadow-brutal transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg z-40 font-black"
        aria-label="Open chatbot"
      >
        <Bot size={20} />
      </button>

      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default ChatbotButton;
