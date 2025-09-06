import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePhoto: true,
              }
            }
          }
        },
        sender: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by product and get latest message for each conversation
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const key = message.productId;
      if (!conversationMap.has(key)) {
        const otherUser = message.senderId === req.user.id ? message.receiver : message.sender;
        conversationMap.set(key, {
          id: `${message.productId}_${otherUser.id}`,
          product: message.product,
          otherUser,
          lastMessage: message,
          messages: [message]
        });
      }
    });

    const uniqueConversations = Array.from(conversationMap.values());

    res.json({ conversations: uniqueConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific product
router.get('/product/:productId', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        productId: req.params.productId,
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { 
      productId, 
      receiverId, 
      content, 
      isOffer = false, 
      isCounterOffer = false,
      isOfferResponse = false, 
      offerAmount = null,
      offerAccepted = false,
      originalOfferId = null
    } = req.body;

    console.log('Sending message:', { 
      senderId: req.user.id, 
      productId, 
      receiverId, 
      content, 
      isOffer, 
      offerAmount 
    });

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if trying to send message to self
    if (req.user.id === receiverId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        productId,
        content,
        isOffer,
        isCounterOffer,
        isOfferResponse,
        offerAmount,
        offerAccepted: isOfferResponse ? offerAccepted : null,
        originalOfferId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          }
        }
      }
    });

    // If this is an offer response, mark the original offer as responded
    if (isOfferResponse && originalOfferId) {
      await prisma.message.update({
        where: { id: originalOfferId },
        data: { 
          responded: true,
          offerAccepted: offerAccepted 
        }
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
