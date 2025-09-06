import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      cartItems,
      totalAmount,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ error: 'Product is not available' });
    }

    if (product.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot add your own product to cart' });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: productId
        }
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + parseInt(quantity) },
        include: {
          product: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                }
              },
              category: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: productId,
          quantity: parseInt(quantity)
        },
        include: {
          product: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                }
              },
              category: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        }
      });
    }

    res.status(201).json({
      message: 'Item added to cart successfully',
      cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { id: req.params.id }
    });

    if (!existingCartItem || existingCartItem.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id: req.params.id }
      });
      return res.json({ message: 'Item removed from cart' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Cart updated successfully',
      cartItem
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { id: req.params.id }
    });

    if (!existingCartItem || existingCartItem.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user.id
      }
    });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
