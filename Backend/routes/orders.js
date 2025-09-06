import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's orders (purchase history)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        orderItems: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the response to match frontend expectations
    const transformedOrders = orders.map(order => ({
      ...order,
      items: order.orderItems // Map orderItems to items
    }));

    res.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create order (checkout)
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        product: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: totalAmount,
          status: 'COMPLETED',
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(item =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            }
          })
        )
      );

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: {
          userId: req.user.id
        }
      });

      // Mark products as unavailable
      await Promise.all(
        cartItems.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: { isAvailable: false }
          })
        )
      );

      return newOrder;
    });

    // Fetch complete order data
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
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
        }
      }
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Create order directly from chat (single product)
router.post('/checkout-direct', authenticateToken, async (req, res) => {
  try {
    const { productId, agreedPrice } = req.body;

    console.log('Direct checkout request:', {
      userId: req.user.id,
      productId,
      agreedPrice
    });

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: true
      }
    });

    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product details:', {
      productId: product.id,
      productUserId: product.userId,
      currentUserId: req.user.id,
      isAvailable: product.isAvailable
    });

    if (!product.isAvailable) {
      console.log('Product not available:', productId);
      return res.status(400).json({ error: 'Product is no longer available' });
    }

    if (product.userId === req.user.id) {
      console.log('User trying to buy own product:', {
        productUserId: product.userId,
        currentUserId: req.user.id
      });
      return res.status(400).json({ error: 'Cannot purchase your own product' });
    }

    // Use agreed price if provided, otherwise use original price
    const finalPrice = agreedPrice || product.price;

    console.log('Creating order with final price:', finalPrice);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: finalPrice,
          status: 'COMPLETED',
        }
      });

      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: product.id,
          quantity: 1,
          price: finalPrice,
        }
      });

      // Mark product as unavailable
      await tx.product.update({
        where: { id: productId },
        data: { isAvailable: false }
      });

      return newOrder;
    });

    // Fetch complete order data
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
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
        }
      }
    });

    console.log('Order created successfully:', order.id);

    res.status(201).json({
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    console.error('Direct checkout error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        orderItems: {
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
        }
      }
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
