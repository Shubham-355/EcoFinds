import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const updateData = {};

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: req.user.id }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      updateData.username = username;
    }

    // Check if email is taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: req.user.id }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
      updateData.email = email;
    }

    // Update profile photo if provided
    if (req.file) {
      updateData.profilePhoto = req.file.path;
    }

    // Update password if provided
    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [totalListings, totalOrders, totalRevenue] = await Promise.all([
      prisma.product.count({
        where: { userId: req.user.id }
      }),
      prisma.order.count({
        where: { userId: req.user.id }
      }),
      prisma.order.aggregate({
        where: { userId: req.user.id },
        _sum: { totalAmount: true }
      })
    ]);

    res.json({
      totalListings,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
