import { Router, Request, Response } from 'express';
import { rateLimiter } from '../middleware/rateLimiter';
import { generateShortCode } from '../utils/shortener';
import { UrlModel } from '../models/Url';

const router = Router();

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a short URL
 *     tags: [URL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 description: The long URL to be shortened
 *                 example: https://www.google.com
 *     responses:
 *       201:
 *         description: URL shortened successfully
 *       400:
 *         description: Invalid URL provided
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post('/shorten', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl || typeof originalUrl !== 'string' || !originalUrl.startsWith('http')) {
      res.status(400).json({
        success: false,
        message: 'Valid URL is required (must start with http or https)'
      });
      return;
    }

    let shortCode = generateShortCode();

    // Handle collision between urls
    let existing = await UrlModel.findByShortCode(shortCode);
    while (existing) {
      shortCode = generateShortCode();
      existing = await UrlModel.findByShortCode(shortCode);
    }

    await UrlModel.create(originalUrl, shortCode);

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${baseUrl}/api/${shortCode}`;

    res.status(201).json({
      success: true,
      shortCode,
      shortUrl,
      originalUrl
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/urls:
 *   get:
 *     summary: Get all shortened URLs
 *     tags: [URL]
 *     responses:
 *       200:
 *         description: A list of shortened URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Failed to fetch URLs
 */
router.get('/urls', async (req: Request, res: Response) => { 
  try {
    const urls = await UrlModel.getAllUrls();
    res.json({ success: true, data: urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch URLs' });
  }
});

/**
 * @swagger
 * /api/analytics/{shortCode}:
 *   get:
 *     summary: Get click analytics for a short URL
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code of the URL
 *     responses:
 *       200:
 *         description: Analytics data for the last 7 days
 *       404:
 *         description: Short URL not found
 *       500:
 *         description: Failed to fetch analytics
 */
router.get('/analytics/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    
    // Check URL exists or not
    const url = await UrlModel.findByShortCode(shortCode);
    if (!url) {
      res.status(404).json({ success: false, message: 'Short URL not found' });
      return;
    }

    const analytics = await UrlModel.getAnalytics(shortCode);
    
    const clickMap = new Map();
    analytics.forEach((item: any) => {
      clickMap.set(item.date, parseInt(item.count, 10) || 0);
    });

    const formattedAnalytics = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      formattedAnalytics.push({
        date: dateString,
        count: clickMap.get(dateString) || 0
      });
    }

    res.json({
      success: true,
      data: formattedAnalytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

/**
 * @swagger
 * /api/{shortCode}:
 *   get:
 *     summary: Redirect to the original URL
 *     tags: [Redirect]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to redirect
 *     responses:
 *       302:
 *         description: Redirect to the original URL
 *       404:
 *         description: Short URL not found
 */
router.get('/:shortCode', async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  
  console.log('Route hit for shortCode:', shortCode);

  if (!shortCode || shortCode === 'undefined' || shortCode === 'favicon.ico') {
    return;
  }

  const url = await UrlModel.findByShortCode(shortCode);

  if (!url) {
    res.status(404).json({ success: false, message: 'Short URL not found' });
    return;
  }


  const ip = req.ip || (req.socket && req.socket.remoteAddress) || '';
  const userAgent = req.get('User-Agent') || '';
  console.log(`from IP: ${ip}`);
  console.log(`with User-Agent: ${userAgent}`);

  await UrlModel.incrementClicks(shortCode);
  await UrlModel.recordClick(shortCode, ip, userAgent);

  res.redirect(302, url.original_url);
});

export default router;