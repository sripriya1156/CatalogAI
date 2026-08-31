import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Item from '../models/Item';
import Shop from '../models/Shop';

// Throttling Cache in memory (IP + productId) to prevent spamming analytics
const viewCache = new Set<string>();
const clickCache = new Set<string>();

// Helper to remove from cache after 1 hour (3600000 ms)
const CACHE_EXPIRY = 3600000;

// Create product
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      shopId,
      name,
      description,
      cost,
      inventory,
      category,
      sizes,
      colors,
      images,
      status,
      tags,
    } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!shopId || !name || !description || cost === undefined || !category) {
      res.status(400).json({ success: false, message: 'Shop ID, name, description, cost, and category are required' });
      return;
    }

    // Verify shop ownership
    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    if (shop.userId.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Not authorized to add products to this shop' });
      return;
    }

    const newProduct = await Item.create({
      shopId,
      name,
      description,
      cost,
      inventory: inventory || 0,
      category,
      sizes: sizes || [],
      colors: colors || [],
      images: images || [],
      status: status || 'active',
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Get all products for a specific shop
export const getProductsByShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopId } = req.params;
    const { search, category, minPrice, maxPrice, size, color, sort } = req.query;

    const filter: any = { shopId };

    // Manage status - non-owners only see 'active' products, but for ease of demo we query based on active status or all for management.
    // By default public discovery only displays 'active' products.
    // If the caller provides authorization, they might see drafts. Here we allow a simple query parameter 'allStatus' for management view
    if (req.query.manage === 'true') {
      // Return drafts, archived etc. for owner view
    } else {
      filter.status = 'active';
    }

    if (category && category !== 'All' && category !== '') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.cost = {};
      if (minPrice) filter.cost.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.cost.$lte = parseFloat(maxPrice as string);
    }

    if (size) {
      filter.sizes = size; // Matches if size string is inside sizes array
    }

    if (color) {
      filter.colors = color; // Matches if color string is inside colors array
    }

    let query = Item.find(filter);

    // Apply sorting
    if (sort === 'price-low') {
      query = query.sort({ cost: 1 });
    } else if (sort === 'price-high') {
      query = query.sort({ cost: -1 });
    } else if (sort === 'popular') {
      query = query.sort({ views: -1, clicks: -1 });
    } else {
      // Default newest
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Get product details
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Item.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Update product
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Item.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Verify ownership of the parent shop
    const shop = await Shop.findById(product.shopId);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Parent shop not found' });
      return;
    }

    if (shop.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Not authorized to update products in this shop' });
      return;
    }

    const updatedProduct = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Delete product
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Item.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Verify ownership of parent shop
    const shop = await Shop.findById(product.shopId);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Parent shop not found' });
      return;
    }

    if (shop.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Not authorized to delete products in this shop' });
      return;
    }

    await Item.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Product successfully deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Throttled product view analytics increment
export const incrementViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const cacheKey = `${ip}-${id}`;

    if (!viewCache.has(cacheKey)) {
      viewCache.add(cacheKey);
      setTimeout(() => viewCache.delete(cacheKey), CACHE_EXPIRY);

      const product = await Item.findById(id);
      if (product) {
        product.views += 1;
        await product.save();

        // Also increment parent shop totalViews
        await Shop.findByIdAndUpdate(product.shopId, { $inc: { totalViews: 1 } });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Throttled product click analytics increment
export const incrementClicks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const cacheKey = `${ip}-${id}`;

    if (!clickCache.has(cacheKey)) {
      clickCache.add(cacheKey);
      setTimeout(() => clickCache.delete(cacheKey), CACHE_EXPIRY);

      const product = await Item.findById(id);
      if (product) {
        product.clicks += 1;
        await product.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
