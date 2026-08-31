import { Request, Response } from 'express';
import {
  generateAIDescription,
  improveAIDescription,
  generateAITags,
  generateAISEOMetadata,
  generateAIImage,
} from '../services/openaiService';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Helper to clean up prompt and return keywords (retained for Unsplash visual query)
const extractKeywords = (prompt: string): string[] => {
  if (!prompt) return [];
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '')
    .split(/\s+/);
  
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'of', 'in', 'on', 'at', 'to', 'for',
    'with', 'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
    'will', 'just', 'don', 'should', 'now', 'generate', 'image', 'photo', 'picture',
    'beautiful', 'high', 'quality', 'studio', 'luxury', 'realistic', 'background',
  ]);

  return words.filter(word => word.length > 2 && !stopWords.has(word));
};

/**
 * 1. AI Product/Shop Description Generator Controller
 * Input validation + OpenAI call
 */
export const generateDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, keywords, targetAudience, tone, type } = req.body;

    // Server-side validation (Cost Protection)
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Name is required for AI generation.' });
      return;
    }
    if (!category || !category.trim()) {
      res.status(400).json({ success: false, message: 'Category is required for AI generation.' });
      return;
    }

    const keywordsArray = keywords
      ? (typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : keywords)
      : [];

    const descriptionType = type === 'shop' ? 'shop' : 'product';

    const text = await generateAIDescription(
      name.trim(),
      category.trim(),
      keywordsArray,
      targetAudience || 'general public',
      tone || 'professional',
      descriptionType
    );

    res.status(200).json({
      success: true,
      data: {
        description: text,
        model: 'gpt-4o-mini',
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * 2. AI Description Polisher Controller
 */
export const improveDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, tone } = req.body;

    // Server-side validation
    if (!description || !description.trim()) {
      res.status(400).json({ success: false, message: 'Existing description text is required to improve.' });
      return;
    }

    const polishedText = await improveAIDescription(description.trim(), tone || 'professional');

    res.status(200).json({
      success: true,
      data: {
        improvedDescription: polishedText,
        model: 'gpt-4o-mini',
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * 3. AI Tags Generator Controller
 */
export const generateTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Product name is required to generate tags.' });
      return;
    }
    if (!description || !description.trim()) {
      res.status(400).json({ success: false, message: 'Product description is required to generate tags.' });
      return;
    }

    const tags = await generateAITags(name.trim(), description.trim());

    res.status(200).json({
      success: true,
      data: {
        tags,
        model: 'gpt-4o-mini',
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * 4. AI SEO Metadata Generator Controller
 */
export const generateSEOMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Name is required to generate SEO metadata.' });
      return;
    }
    if (!description || !description.trim()) {
      res.status(400).json({ success: false, message: 'Description is required to generate SEO metadata.' });
      return;
    }

    const seoData = await generateAISEOMetadata(name.trim(), description.trim());

    res.status(200).json({
      success: true,
      data: seoData, // Returns { seoTitle, metaDescription, keywords }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * 5. Simulated AI Image Generator (retains Unsplash keyword finder)
 */
// Helper to fetch an image URL to buffer and upload it via stream to Cloudinary
const uploadUrlToCloudinary = async (url: string, folder: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image from source URL: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

const getFallbackImageUrl = (prompt: string, category: string): string => {
  const combined = `${prompt} ${category}`.toLowerCase();
  
  if (combined.includes('ring') || combined.includes('jewel') || combined.includes('gem') || combined.includes('gold') || combined.includes('necklace') || combined.includes('earring') || combined.includes('bracelet')) {
    return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'; // Ring
  }
  if (combined.includes('dress') || combined.includes('saree') || combined.includes('cloth') || combined.includes('apparel') || combined.includes('fashion') || combined.includes('wear') || combined.includes('sari') || combined.includes('suit') || combined.includes('shirt')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'; // Dress
  }
  if (combined.includes('shoe') || combined.includes('footwear') || combined.includes('sneaker') || combined.includes('boot')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'; // Shoe
  }
  if (combined.includes('bag') || combined.includes('purse') || combined.includes('backpack') || combined.includes('handbag')) {
    return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'; // Handbag
  }
  if (combined.includes('watch') || combined.includes('time') || combined.includes('clock')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'; // Watch
  }
  
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'; // Headphone
};

// Dynamic fallback calling Flickr's public tag feed for accurate matching images
const fetchFlickrImageUrl = async (prompt: string, category: string): Promise<string> => {
  try {
    const keywords = extractKeywords(prompt || '');
    if (category) {
      keywords.push(category.toLowerCase().replace(/\s+/g, ''));
    }
    const searchTerms = keywords.length > 0 ? keywords.slice(0, 3).join(',') : 'product';
    const url = `https://www.flickr.com/services/feeds/photos_public.gne?tags=${searchTerms}&format=json&nojsoncallback=1`;

    const response = await fetch(url);
    if (response.ok) {
      const data: any = await response.json();
      if (data?.items && data.items.length > 0) {
        // Retrieve random item from top 5 for variety
        const maxIdx = Math.min(data.items.length, 5);
        const randomItem = data.items[Math.floor(Math.random() * maxIdx)] || data.items[0];
        if (randomItem?.media?.m) {
          // Upgrade small medium format to large high-res format
          return randomItem.media.m.replace('_m.', '_b.');
        }
      }
    }
  } catch (error) {
    console.warn('Flickr keyword search failed, using static category fallback:', error);
  }
  
  return getFallbackImageUrl(prompt, category);
};

/**
 * 5. Simulated AI Image Generator (retains Unsplash keyword finder)
 */
export const generateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, category } = req.body;

    if (!prompt && !category) {
      res.status(400).json({ success: false, message: 'Prompt or category is required to generate visual.' });
      return;
    }

    let secureUrl = '';
    let isRealAI = false;

    // Try OpenAI DALL-E image generation
    try {
      const imagePrompt = prompt || `Studio photography of ${category || 'product'}`;
      const sourceUrl = await generateAIImage(imagePrompt);
      isRealAI = true;
      
      // Upload DALL-E URL to Cloudinary (buffer download)
      secureUrl = await uploadUrlToCloudinary(sourceUrl, 'ai_generated');
    } catch (err: any) {
      console.warn('DALL-E image generation failed, falling back to Flickr tags search:', err.message);
      
      // Dynamic search on Flickr based on prompt/category keywords
      const fallbackUrl = await fetchFlickrImageUrl(prompt || '', category || '');
      
      // Upload Flickr image URL directly to Cloudinary (live.staticflickr.com works natively)
      const uploadResult = await cloudinary.uploader.upload(fallbackUrl, {
        folder: 'ai_generated',
      });
      secureUrl = uploadResult.secure_url;
    }

    res.status(200).json({
      success: true,
      data: {
        imageUrl: secureUrl,
        aiPrompt: prompt || `Studio photography of ${category}`,
        source: isRealAI ? 'ai-generated' : 'unsplash-fallback',
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("aiController generateImage error:", error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
