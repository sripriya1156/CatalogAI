import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IProductImage {
  _id: mongoose.Types.ObjectId;
  imageUrl: string;
  imageSource: 'upload' | 'ai-generated' | 'ai-enhanced';
  aiPrompt?: string;
  parentImageId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IAIMetadata {
  descriptionPrompt?: string;
  generatedAt?: Date;
  model?: string;
}

export interface IItem extends Document {
  itemKey: string;
  shopId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  aiGeneratedDescription?: string;
  aiMetadata?: IAIMetadata;
  cost: number;
  rating?: number;
  inventory: number;
  isFeatured: boolean;
  status: 'active' | 'draft' | 'archived';
  views: number;
  clicks: number;
  tags: string[];
  category: string;
  sizes: string[];
  colors: string[];
  images: IProductImage[];
  seoTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema: Schema = new Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  imageSource: {
    type: String,
    enum: ['upload', 'ai-generated', 'ai-enhanced'],
    required: [true, 'Image source type is required'],
  },
  aiPrompt: {
    type: String,
    default: '',
  },
  parentImageId: {
    type: Schema.Types.ObjectId,
    ref: 'Item.images',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ItemSchema: Schema = new Schema(
  {
    itemKey: {
      type: String,
      unique: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    aiGeneratedDescription: {
      type: String,
      default: '',
    },
    aiMetadata: {
      descriptionPrompt: { type: String, default: '' },
      generatedAt: { type: Date },
      model: { type: String, default: '' },
    },
    cost: {
      type: Number,
      required: [true, 'Product cost is required'],
      min: [0, 'Cost must be 0 or positive'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    inventory: {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Uncategorized',
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    seoTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ItemSchema.index({ itemKey: 1 }, { unique: true });
ItemSchema.index({ shopId: 1, status: 1 });
ItemSchema.index({ shopId: 1, category: 1, status: 1 });
ItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Pre-save hook to generate unique itemKey
ItemSchema.pre<IItem>('save', async function () {
  if (this.isNew || !this.itemKey) {
    let uniqueKey = '';
    let isUnique = false;

    while (!isUnique) {
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      uniqueKey = `ITEM-${randomHex}`;

      const existingItem = await mongoose.models.Item.findOne({ itemKey: uniqueKey });
      if (!existingItem) {
        isUnique = true;
      }
    }

    this.itemKey = uniqueKey;
  }
});

export default mongoose.model<IItem>('Item', ItemSchema);
