import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Shop from '../models/Shop';
import Item from '../models/Item';
import crypto from 'crypto';

// Helper to generate unique slug with a random 4-character suffix
const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/(^-|-$)+/g, '');   // Trim leading/trailing dashes
  
  let slug = baseSlug || 'shop';
  let isUnique = false;
  
  while (!isUnique) {
    const randomSuffix = crypto.randomBytes(2).toString('hex'); // 4-character hex
    const candidateSlug = `${slug}-${randomSuffix}`;
    const existing = await Shop.findOne({ shopSlug: candidateSlug });
    if (!existing) {
      slug = candidateSlug;
      isUnique = true;
    }
  }
  return slug;
};

// Create a new shop
export const createShop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      shopName,
      about,
      category,
      theme,
      logo,
      banner,
      phone,
      businessEmail,
      website,
      instagram,
      facebook,
      linkedin,
      address,
      seoTitle,
      metaDescription,
      seoKeywords,
    } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!shopName || !about || !category) {
      res.status(400).json({ success: false, message: 'Shop name, about, and category are required' });
      return;
    }

    // Generate unique slug
    const shopSlug = await generateUniqueSlug(shopName);

    const newShop = await Shop.create({
      userId: req.user.id,
      shopName,
      shopSlug,
      about,
      category,
      theme: theme || {
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981',
        fontColor: '#1F2937',
        font: 'Inter',
      },
      logo: logo || '',
      banner: banner || '',
      phone: phone || '',
      businessEmail: businessEmail || '',
      website: website || '',
      instagram: instagram || '',
      facebook: facebook || '',
      linkedin: linkedin || '',
      address: address || '',
      seoTitle: seoTitle || '',
      metaDescription: metaDescription || '',
      seoKeywords: seoKeywords || [],
    });

    res.status(201).json({ success: true, data: newShop });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Get all shops (public discovery)
export const getAllShops = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, featured } = req.query;
    const filter: any = { isActive: true };

    if (category && category !== 'Others' && category !== 'All') {
      filter.category = category;
    } else if (category === 'Others') {
      // Fetch shops not in the standard categories
      filter.category = { $nin: ['Jewellery', 'Dresses', 'Fancy Items'] };
    }

    if (search) {
      filter.shopName = { $regex: search, $options: 'i' };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Sort by views or created date
    const shops = await Shop.find(filter).sort({ totalViews: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: shops.length, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Get current merchant's shops
export const getMyShops = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const shops = await Shop.find({ userId: req.user.id });
    res.status(200).json({ success: true, count: shops.length, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Get shop by slug (for public catalog)
export const getShopBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const shop = await Shop.findOne({ shopSlug: slug });

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    // Increment visit statistics
    shop.totalVisits += 1;
    shop.totalViews += 1; // Also treat public profile opening as a view
    await shop.save();

    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Get shop by ID
export const getShopById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Update shop details
export const updateShop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    // Authorization check
    if (shop.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Not authorized to edit this shop' });
      return;
    }

    const updatedShop = await Shop.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedShop });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Delete shop
export const deleteShop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    // Authorization check
    if (shop.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this shop' });
      return;
    }

    // Remove shop
    await Shop.findByIdAndDelete(id);

    // Cascade delete all items belonging to this shop
    await Item.deleteMany({ shopId: id });

    res.status(200).json({ success: true, message: 'Shop and all its items deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
