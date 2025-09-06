import { GoogleGenAI } from '@google/genai';
import { prisma } from '../index.js';

class ChatbotService {
  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  async processMessage(message, userId = null) {
    try {
      // Get products from database for context
      const products = await this.getProductsForContext();
      const categories = await this.getCategoriesForContext();
      
      // Create a context-aware prompt
      const prompt = this.createPrompt(message, products, categories);
      
      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const text = result.text;
      
      // Parse the response to extract product recommendations
      const parsedResponse = this.parseResponse(text, products);
      
      return parsedResponse;
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        products: [],
        type: 'error'
      };
    }
  }

  async getProductsForContext() {
    return await prisma.product.findMany({
      where: { isAvailable: true },
      include: {
        category: true,
        user: {
          select: { username: true }
        }
      },
      take: 50, // Limit for context
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCategoriesForContext() {
    return await prisma.category.findMany();
  }

  createPrompt(userMessage, products, categories) {
    const productList = products.map(p => 
      `ID: ${p.id}, Title: ${p.title}, Price: $${p.price}, Category: ${p.category.name}, Description: ${p.description}`
    ).join('\n');
    
    const categoryList = categories.map(c => c.name).join(', ');

    return `You are an AI shopping assistant for EcoFinds, a marketplace for eco-friendly and sustainable products. 
Your role is to help users find products, answer questions about sustainability, and provide helpful shopping advice.

Available Categories: ${categoryList}

Available Products:
${productList}

User Message: "${userMessage}"

Instructions:
1. If the user is asking about specific products, searching for something, or wants recommendations, respond with relevant product suggestions
2. Include product IDs in your response when recommending specific items
3. Be helpful, friendly, and focus on sustainability aspects
4. If recommending products, format your response to include: [PRODUCTS: id1,id2,id3] at the end
5. Keep responses concise but informative
6. If no relevant products found, suggest alternatives or ask clarifying questions

Respond naturally and helpfully:`;
  }

  parseResponse(text, products) {
    // Extract product IDs from response
    const productMatches = text.match(/\[PRODUCTS:\s*([^\]]+)\]/);
    let recommendedProducts = [];
    
    if (productMatches && productMatches[1]) {
      const productIds = productMatches[1].split(',').map(id => id.trim());
      recommendedProducts = products.filter(p => productIds.includes(p.id));
    }

    // Clean the text response
    const cleanText = text.replace(/\[PRODUCTS:[^\]]+\]/, '').trim();

    return {
      text: cleanText,
      products: recommendedProducts,
      type: recommendedProducts.length > 0 ? 'products' : 'text'
    };
  }
}

export default new ChatbotService();
