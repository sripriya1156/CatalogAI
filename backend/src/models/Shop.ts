import mongoose, { Schema, Document } from 'mongoose';

export interface IShopTheme {
  primaryColor: string;
  secondaryColor: string;
  fontColor: string;
  font: string;
}

export interface IShop extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  shopSlug: string;
  about: string;
  logo?: string;
  banner?: string;
  phone?: string;
  businessEmail?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  address?: string;
  category: string;
  theme: IShopTheme;
  isFeatured: boolean;
  plan: 'free' | 'pro' | 'premium';
  isActive: boolean;
  totalViews: number;
  totalVisits: number;
  seoTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner reference is required'],
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: [100, 'Shop name cannot exceed 100 characters'],
    },
    shopSlug: {
      type: String,
      required: [true, 'Shop slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase alphanumeric characters and dashes',
      ],
    },
    about: {
      type: String,
      required: [true, 'About description is required'],
      trim: true,
      maxlength: [2000, 'About details cannot exceed 2000 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    instagram: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Shop business category is required'],
      default: 'General',
    },
    theme: {
      primaryColor: { type: String, default: '#4F46E5' },
      secondaryColor: { type: String, default: '#10B981' },
      fontColor: { type: String, default: '#1F2937' },
      font: { type: String, default: 'Inter' },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalVisits: {
      type: Number,
      default: 0,
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

// Indexes for slug routes and ownership checks
ShopSchema.index({ shopSlug: 1 }, { unique: true });
ShopSchema.index({ userId: 1 });

export default mongoose.model<IShop>('Shop', ShopSchema);
