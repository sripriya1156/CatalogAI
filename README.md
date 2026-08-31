# Catalog Builder

A full-stack e-commerce catalog management platform with AI-powered product description and image generation.

## Overview

Catalog Builder enables merchants to:
- Create and manage digital storefronts (shops)
- Add and organize product catalogs
- Auto-generate product descriptions, tags, and SEO metadata using OpenAI
- Generate product images with DALL-E or fallback to Flickr
- Upload images to Cloudinary for reliable hosting
- Track shop and product analytics (views, clicks)
- Manage user accounts with JWT authentication

---

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer (memory storage)
- **Image Hosting**: Cloudinary
- **AI Services**: OpenAI (GPT-4o-mini for text, DALL-E 3 for images)
- **Rate Limiting**: express-rate-limit
- **CORS**: cors

### Frontend
- **Framework**: React
- **Routing**: React Router
- **HTTP Client**: (TBD - check frontend config)
- **Styling**: (TBD - check frontend config)

---

## Project Structure

```
catalog-builder/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # MongoDB connection
│   │   │   └── cloudinary.ts      # Cloudinary configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Login & register
│   │   │   ├── userController.ts  # User profile & password
│   │   │   ├── shopController.ts  # Shop CRUD
│   │   │   ├── productController.ts # Product CRUD & analytics
│   │   │   ├── uploadController.ts  # Image upload
│   │   │   └── aiController.ts    # AI generation endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts  # JWT verification
│   │   │   ├── uploadMiddleware.ts # Multer config
│   │   │   └── aiLimiter.ts       # Rate limiting (10 req/min)
│   │   ├── models/
│   │   │   ├── User.ts            # User schema
│   │   │   ├── Shop.ts            # Shop schema
│   │   │   └── Item.ts            # Product schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── shopRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── uploadRoutes.ts
│   │   │   └── aiRoutes.ts
│   │   ├── services/
│   │   │   └── openaiService.ts   # OpenAI API calls
│   │   └── server.ts              # Express app entry point
│   ├── dist/                      # Compiled JavaScript
│   ├── .env                       # (DO NOT COMMIT - see .gitignore)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (use `.env.example` as reference)
   ```bash
   PORT=5000
   NODE_ENV=development
   
   # MongoDB
   MONGO_URI=mongodb://localhost:27017/catalog_builder
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=24h
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # OpenAI (optional - system runs with simulated fallback if not set)
   OPENAI_API_KEY=sk-...
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Server starts on `http://localhost:5000`

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Start production server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Shops
- `GET /api/shops` - Get all active shops (public)
- `GET /api/shops/slug/:slug` - Get shop by slug (public)
- `GET /api/shops/my` - Get current user's shops (protected)
- `GET /api/shops/:id` - Get shop details (protected)
- `POST /api/shops` - Create shop (protected)
- `PUT /api/shops/:id` - Update shop (protected)
- `DELETE /api/shops/:id` - Delete shop (protected)

### Products
- `GET /api/products/shop/:shopId` - Get products by shop (public)
- `GET /api/products/:id` - Get product details (public)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)
- `POST /api/products/:id/view` - Increment view count (public, throttled)
- `POST /api/products/:id/click` - Increment click count (public, throttled)

### Image Upload
- `POST /api/upload` - Upload image to Cloudinary (protected)
  - Input: `file` (multipart, image only, max 5MB)
  - Output: `{ success: true, url: "https://..." }`

### AI Endpoints (Protected, Rate Limited: 10 req/min per IP)
- `POST /api/ai/generate-description` - Generate product description
  - Input: `{ name, category, keywords[], targetAudience, tone, type }`
  - Output: `{ description, model, generatedAt }`

- `POST /api/ai/improve-description` - Polish existing description
  - Input: `{ description, tone }`
  - Output: `{ improvedDescription, model, generatedAt }`

- `POST /api/ai/generate-tags` - Generate SEO tags
  - Input: `{ name, description }`
  - Output: `{ tags: [...], model, generatedAt }`

- `POST /api/ai/generate-seo` - Generate SEO metadata
  - Input: `{ name, description }`
  - Output: `{ seoTitle, metaDescription, keywords: [...] }`

- `POST /api/ai/generate-image` - Generate product image
  - Input: `{ prompt, category }`
  - Output: `{ imageUrl, aiPrompt, source, generatedAt }`
  - Source: `"ai-generated"` (DALL-E) or `"unsplash-fallback"` (Flickr)

### Health Check
- `GET /api/health` - API status check

---

## Image Hosting & AI Flow

### Image Upload Flow
```
User uploads file → Multer (memory buffer) → Cloudinary → secure_url
```

### AI Image Generation Flow
```
User provides prompt → OpenAI DALL-E → Image URL → Cloudinary → secure_url
                                          ↓ (if fails)
                                      Flickr API → Image URL → Cloudinary
```

### AI Text Generation Flow
```
User provides input → OpenAI GPT-4o-mini → Generated text
                        ↓ (if fails/no key)
                     Simulated fallback → Placeholder text
```

---

## Key Features

### Authentication
- JWT-based stateless authentication
- Password hashing with bcrypt
- Protected routes require valid Bearer token

### Shop Management
- Unique shop slugs for public discovery
- Custom themes (colors, fonts)
- SEO metadata support
- Analytics (total visits, total views)

### Product Management
- Product variants (sizes, colors)
- Inventory tracking
- Status (active, draft, archived)
- Product analytics (views, clicks)

### AI Integration
- Fallback mode: If OpenAI key is missing, system uses simulated responses
- Rate limiting on AI endpoints to control costs
- Comprehensive error handling with logging

### Image Hosting
- Cloudinary integration for reliable CDN delivery
- Automatic folder organization (`catalog_builder`, `ai_generated`)
- Support for multiple image sources (user upload, DALL-E, Flickr)

### Analytics
- View tracking with IP-based throttling (1 hour cache per product)
- Click tracking with IP-based throttling
- Shop-level visit/view aggregation

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `JWT_EXPIRE` | No | JWT expiration time (default: 24h) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `OPENAI_API_KEY` | No | OpenAI API key (optional; uses fallback if missing) |

---

## Development Notes

### Testing AI Endpoints
Test files are in `backend/src/`:
- `test_ai_all.ts` - Tests all AI generation functions
- `test_flickr.ts` - Tests Flickr image search
- `test_upload.ts` - Tests Cloudinary upload
- `test_key.ts` - Prints OpenAI API key (for debugging)

Run tests:
```bash
npx ts-node src/test_ai_all.ts
```

### Running in Fallback Mode
If you don't have an OpenAI API key, the system will:
1. Return simulated text responses for AI endpoints
2. Still work fully for uploads, shops, products
3. Log warnings about running in fallback mode

This is useful for local development without OpenAI costs.

### Rate Limiting
- AI endpoints: 10 requests per minute per IP
- View/click tracking: 1 request per hour per IP per product

---

## Error Handling

All endpoints follow a consistent error response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Successful responses:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open a pull request

### Code Style
- TypeScript for type safety
- ESLint/Prettier (if configured)
- Meaningful variable names and comments for complex logic

---


---

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
