import express from 'express';
import chatbotService from '../services/chatbotService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Chat with the bot
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatbotService.processMessage(message, req.user.id);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chatbot route error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat suggestions/quick responses
router.get('/suggestions', async (req, res) => {
  try {
    const suggestions = [
      "Show me eco-friendly products",
      "What are the latest sustainable items?",
      "Find products under $50",
      "Show me electronics",
      "What's trending in home & garden?",
      "Help me find gifts"
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;
