import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, userId, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isAvailable: true,
    };

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.categoryId = category;
    }

    if (userId) {
      where.userId = userId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, categoryId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        image: req.file.path,
        userId: req.user.id,
        categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, categoryId, isAvailable } = req.body;
    
    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (categoryId) updateData.categoryId = categoryId;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true';
    if (req.file) updateData.image = req.file.path;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get user's products
router.get('/user/my-listings', authenticateToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ products });
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ error: 'Failed to fetch user products' });
  }
});

export default router;
