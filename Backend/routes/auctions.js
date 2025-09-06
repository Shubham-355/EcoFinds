import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Create auction
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, startingBid, reservePrice, categoryId, startTime, endTime } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Auction image is required' });
    }

    // Validate required fields
    if (!title || !description || !startingBid || !categoryId || !startTime || !endTime) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start <= now) {
      return res.status(400).json({ error: 'Start time must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (end - start < 30 * 60 * 1000) {
      return res.status(400).json({ error: 'Auction must run for at least 30 minutes' });
    }

    // Validate bid amounts
    const startingBidNum = parseFloat(startingBid);
    const reservePriceNum = reservePrice ? parseFloat(reservePrice) : null;

    if (isNaN(startingBidNum) || startingBidNum <= 0) {
      return res.status(400).json({ error: 'Valid starting bid is required' });
    }

    if (reservePriceNum && (isNaN(reservePriceNum) || reservePriceNum < startingBidNum)) {
      return res.status(400).json({ error: 'Reserve price must be higher than starting bid' });
    }

    // Determine initial status
    const initialStatus = start <= now ? 'LIVE' : 'SCHEDULED';

    // Create auction with timeout handling
    const auction = await Promise.race([
      prisma.auction.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          startingBid: startingBidNum,
          reservePrice: reservePriceNum,
          image: req.file.path,
          userId: req.user.id,
          categoryId,
          startTime: start,
          endTime: end,
          status: initialStatus
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
          },
          _count: {
            select: {
              bids: true
            }
          }
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout')), 30000)
      )
    ]);

    res.status(201).json({
      message: 'Auction created successfully',
      auction
    });
  } catch (error) {
    console.error('Create auction error:', error);
    
    if (error.message === 'Database operation timeout') {
      return res.status(408).json({ error: 'Request timeout. Please try again.' });
    }
    
    if (error.name === 'TimeoutError' || error.http_code === 499) {
      return res.status(408).json({ error: 'Upload timeout. Please try with a smaller image.' });
    }
    
    // Handle Prisma/Database errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A unique constraint failed. Please check your data.' });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found. Please select a valid category.' });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to create auction' 
    });
  }
});

// Get all auctions with filters
router.get('/', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, profilePhoto: true }
        },
        category: true,
        bids: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { amount: 'desc' },
          take: 1
        },
        _count: {
          select: { bids: true }
        }
      },
      orderBy: { startTime: 'asc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.auction.count({ where });

    res.json({
      auctions: auctions.map(auction => ({
        ...auction,
        currentBid: auction.bids[0]?.amount || auction.startingBid,
        bidCount: auction._count.bids || 0,
        highestBidder: auction.bids[0]?.user
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalPages: Math.ceil(total / limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, username: true, profilePhoto: true }
        },
        category: true,
        bids: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { amount: 'desc' }
        }
      }
    });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json({
      auction: {
        ...auction,
        currentBid: auction.bids[0]?.amount || auction.startingBid,
        bidCount: auction.bids.length,
        highestBidder: auction.bids[0]?.user
      }
    });
  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// Get auction bids
router.get('/:id/bids', async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: {
        auctionId: req.params.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePhoto: true
          }
        }
      },
      orderBy: {
        amount: 'desc'
      }
    });

    res.json({ bids });
  } catch (error) {
    console.error('Get auction bids error:', error);
    res.status(500).json({ error: 'Failed to fetch auction bids' });
  }
});

// Place bid
router.post('/:id/bid', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const auctionId = req.params.id;

    // Get auction details
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Check if user is the auction owner
    if (auction.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot bid on your own auction' });
    }

    // Check auction status and time
    const now = new Date();
    if (now < new Date(auction.startTime)) {
      return res.status(400).json({ error: 'Auction has not started yet' });
    }

    if (now > new Date(auction.endTime) || auction.status === 'ENDED') {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    // Check bid amount
    const currentHighestBid = auction.bids[0]?.amount || auction.startingBid;
    if (amount <= currentHighestBid) {
      return res.status(400).json({ 
        error: `Bid must be higher than current highest bid of $${currentHighestBid}` 
      });
    }

    // Update auction status to LIVE if it's SCHEDULED and within time range
    if (auction.status === 'SCHEDULED' && now >= new Date(auction.startTime)) {
      await prisma.auction.update({
        where: { id: auctionId },
        data: { status: 'LIVE' }
      });
    }

    // Create transaction to handle bid placement
    const result = await prisma.$transaction(async (tx) => {
      // Mark previous bids from this user as OUTBID
      await tx.bid.updateMany({
        where: {
          auctionId,
          userId: req.user.id,
          status: 'ACTIVE'
        },
        data: { status: 'OUTBID' }
      });

      // Mark current highest bid as OUTBID
      if (auction.bids[0]) {
        await tx.bid.update({
          where: { id: auction.bids[0].id },
          data: { status: 'OUTBID' }
        });
      }

      // Create new bid
      const bid = await tx.bid.create({
        data: {
          amount: parseFloat(amount),
          auctionId,
          userId: req.user.id,
          status: 'WINNING'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePhoto: true
            }
          }
        }
      });

      return bid;
    });

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: result
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

// Approve bid (for auction owner)
router.post('/:id/approve-bid/:bidId', authenticateToken, async (req, res) => {
  try {
    const { id: auctionId, bidId } = req.params;

    // Get auction and bid
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId }
    });

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        user: true
      }
    });

    if (!auction || !bid) {
      return res.status(404).json({ error: 'Auction or bid not found' });
    }

    // Check if user is auction owner
    if (auction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Only auction owner can approve bids' });
    }

    // Check if auction is live
    if (auction.status !== 'LIVE' && auction.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Cannot approve bids for ended auction' });
    }

    // Approve bid and end auction
    await prisma.$transaction(async (tx) => {
      // Update auction status
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: 'ENDED',
          winningBidId: bidId
        }
      });

      // Update winning bid status
      await tx.bid.update({
        where: { id: bidId },
        data: { status: 'WON' }
      });

      // Mark all other bids as OUTBID
      await tx.bid.updateMany({
        where: {
          auctionId,
          id: { not: bidId }
        },
        data: { status: 'OUTBID' }
      });

      // Create order for the winning bidder
      const order = await tx.order.create({
        data: {
          userId: bid.userId,
          totalAmount: bid.amount,
          status: 'COMPLETED'
        }
      });

      // Create a virtual product entry for the auction item
      const auctionProduct = await tx.product.create({
        data: {
          title: auction.title,
          description: auction.description,
          price: bid.amount,
          image: auction.image || '',
          isAvailable: false,
          userId: auction.userId,
          categoryId: auction.categoryId
        }
      });

      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: auctionProduct.id,
          quantity: 1,
          price: bid.amount
        }
      });
    });

    res.json({ message: 'Bid approved and auction ended successfully' });
  } catch (error) {
    console.error('Approve bid error:', error);
    res.status(500).json({ error: 'Failed to approve bid' });
  }
});

// Update auction status based on time
router.patch('/update-status', async (req, res) => {
  try {
    const now = new Date();

    // Update SCHEDULED auctions to LIVE
    await prisma.auction.updateMany({
      where: {
        status: 'SCHEDULED',
        startTime: { lte: now },
        endTime: { gt: now }
      },
      data: { status: 'LIVE' }
    });

    // Update LIVE auctions to ENDED
    await prisma.auction.updateMany({
      where: {
        status: 'LIVE',
        endTime: { lte: now }
      },
      data: { status: 'ENDED' }
    });

    res.json({ message: 'Auction statuses updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update auction statuses' });
  }
});

// Get user's auctions
router.get('/user/my-auctions', authenticateToken, async (req, res) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { userId: req.user.id },
      include: {
        category: true,
        bids: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { amount: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      auctions: auctions.map(auction => ({
        ...auction,
        currentBid: auction.bids[0]?.amount || auction.startingBid,
        bidCount: auction.bids.length,
        highestBidder: auction.bids[0]?.user
      }))
    });
  } catch (error) {
    console.error('Get user auctions error:', error);
    res.status(500).json({ error: 'Failed to fetch user auctions' });
  }
});

// Update auction status (for scheduled auctions)
router.post('/update-status', async (req, res) => {
  try {
    const now = new Date();

    // Start scheduled auctions
    await prisma.auction.updateMany({
      where: {
        status: 'SCHEDULED',
        startTime: { lte: now }
      },
      data: { status: 'LIVE' }
    });

    // End live auctions
    await prisma.auction.updateMany({
      where: {
        status: 'LIVE',
        endTime: { lte: now }
      },
      data: { status: 'ENDED' }
    });

    res.json({ message: 'Auction statuses updated' });
  } catch (error) {
    console.error('Update auction status error:', error);
    res.status(500).json({ error: 'Failed to update auction status' });
  }
});

export default router;
