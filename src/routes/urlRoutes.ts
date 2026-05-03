import { Router, Request, Response } from 'express';
import { rateLimiter } from '../middleware/rateLimiter';
import { generateShortCode } from '../utils/shortener';
import { UrlModel } from '../models/Url';

const router = Router();

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

    let shortCode = generateShortCode(originalUrl);

    // Handle collision between urls
    let existing = await UrlModel.findByShortCode(shortCode);
    while (existing) {
      shortCode = generateShortCode(originalUrl);
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

// Get all URLs 
router.get('/urls', async (req: Request, res: Response) => { 
  try {
    const urls = await UrlModel.getAllUrls();
    res.json({ success: true, data: urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch URLs' });
  }
});

//  Get analytics for a specific URL based on the alias code
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


// Redirect + Track Click
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