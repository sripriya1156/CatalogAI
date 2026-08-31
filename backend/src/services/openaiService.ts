import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const isDummyKey = !apiKey || apiKey.startsWith('your_') || apiKey.includes('change_me') || apiKey === 'dummy';

if (isDummyKey) {
  console.warn('WARNING: OPENAI_API_KEY is not configured or is set to a dummy value. The system will run in Simulated AI fallback mode.');
}

const openai = isDummyKey ? null : new OpenAI({ apiKey });

// Helper to clean and parse JSON securely
const parseJSONResponse = <T>(text: string, fallback: T): T => {
  try {
    // Strip markdown code block wrappers if any
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as T;
  } catch (error) {
    console.error('Failed to parse JSON response from OpenAI:', text, error);
    return fallback;
  }
};

/**
 * 1. AI Description Generator
 * Generates a 100-150 word product or shop description.
 */
export const generateAIDescription = async (
  name: string,
  category: string,
  keywords: string[],
  targetAudience: string = 'general public',
  tone: string = 'professional',
  type: 'product' | 'shop' = 'product'
): Promise<string> => {
  if (!name || !category) {
    throw new Error('Name and category are required to generate a description.');
  }

  const keywordsStr = keywords && keywords.length > 0 ? keywords.join(', ') : 'none';
  const systemPrompt = `You are an expert copywriter specializing in e-commerce and catalog SEO.`;
  const userPrompt = `Write a compelling, SEO-friendly, and conversion-focused ${type} description for a "${name}" under the category "${category}".
Key features/highlights to include: ${keywordsStr}.
Target audience: ${targetAudience}.
Tone of voice: ${tone}.
Length constraints: 100 to 150 words.
Do not include any HTML tags or markdown formatting. Output only the raw, ready-to-publish text.`;

  if (!openai) {
    // Simulated Fallback
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Experience the exceptional quality of our ${name}, a premier choice in the ${category} category. Designed meticulously for ${targetAudience || 'discerning customers'} and highlighting key elements like ${keywordsStr}, it brings out a professional level of sophistication. We created this ${type} for those who value premium materials and craftsmanship. ${tone === 'luxurious' ? 'A true statement of luxury and exclusivity. Indulge in premium details today.' : 'Add it to your collection today for an elevated lifestyle.'}`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content?.trim() || '';
  } catch (err: any) {
    console.error('OpenAI generateDescription API call failed, falling back to simulation:', err.message);
    return `Experience the exceptional quality of our ${name}, a premier choice in the ${category} category. Designed meticulously for ${targetAudience || 'discerning customers'} and highlighting key elements like ${keywordsStr}, it brings out a professional level of sophistication. We created this ${type} for those who value premium materials and craftsmanship. ${tone === 'luxurious' ? 'A true statement of luxury and exclusivity. Indulge in premium details today.' : 'Add it to your collection today for an elevated lifestyle.'}`;
  }
};

/**
 * 2. AI Description Polisher
 * Improves a raw description drafted by the user.
 */
export const improveAIDescription = async (
  description: string,
  tone: string = 'professional'
): Promise<string> => {
  if (!description || description.trim().length === 0) {
    throw new Error('Description text is required to improve.');
  }

  const systemPrompt = `You are an expert editor and copywriter.`;
  const userPrompt = `Please polish, refine, and improve the following raw text for an e-commerce catalog. 
Make it more engaging, professional, SEO-friendly, and conversion-focused while maintaining a "${tone}" tone.
Raw text:
"${description}"

Length constraints: 100 to 150 words.
Do not include any HTML tags or markdown formatting. Output only the polished description text.`;

  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Refined for modern style, this carefully polished piece combines everyday utility with elegant design. Meticulously curated with a ${tone} tone, it delivers an outstanding catalog experience. Crafted for customers who appreciate premium materials and genuine attention to detail, this item elevates your brand presence. Upgrade your collection today and enjoy timeless quality.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content?.trim() || '';
  } catch (err: any) {
    console.error('OpenAI improveDescription API call failed, falling back to simulation:', err.message);
    return `Refined for modern style, this carefully polished piece combines everyday utility with elegant design. Meticulously curated with a ${tone} tone, it delivers an outstanding catalog experience. Crafted for customers who appreciate premium materials and genuine attention to detail, this item elevates your brand presence. Upgrade your collection today and enjoy timeless quality.`;
  }
};

/**
 * 3. AI Product Tags Generator
 * Extracts 4-8 relevant tags based on name and description.
 */
export const generateAITags = async (name: string, description: string): Promise<string[]> => {
  if (!name || !description) {
    throw new Error('Product name and description are required to generate tags.');
  }

  const systemPrompt = `You are an SEO specialist. Return ONLY a JSON object.`;
  const userPrompt = `Based on the product name "${name}" and description "${description}", generate a list of 4 to 8 highly relevant, lowercase, single-word search tags.
Return the output strictly as a JSON object with a key named "tags" containing an array of strings.
Example structure:
{
  "tags": ["luxury", "diamond", "necklace", "jewellery"]
}
Do not wrap your output in markdown code blocks.`;

  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [name.toLowerCase().split(/\s+/)[0], 'premium', 'luxury', 'collection', 'exclusive'].filter(Boolean);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 150,
    });

    const text = completion.choices[0].message.content || '{}';
    const parsed = parseJSONResponse<{ tags: string[] }>(text, { tags: [] });
    return parsed.tags || [];
  } catch (err: any) {
    console.error('OpenAI generateTags API call failed, falling back to simulation:', err.message);
    return [name.toLowerCase().split(/\s+/)[0], 'premium', 'luxury', 'collection', 'exclusive'].filter(Boolean);
  }
};

/**
 * 4. AI SEO Metadata Generator
 * Compiles a title, meta description, and keywords.
 */
export interface SEOMetadata {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

export const generateAISEOMetadata = async (name: string, description: string): Promise<SEOMetadata> => {
  if (!name || !description) {
    throw new Error('Name and description are required to generate SEO metadata.');
  }

  const systemPrompt = `You are an search engine optimization (SEO) specialist. Return ONLY a JSON object.`;
  const userPrompt = `Generate SEO meta configuration for a shop or product named "${name}" with the description: "${description}".
Return the output strictly as a JSON object containing the following keys:
- "seoTitle": Search optimized title tag (50-60 characters).
- "metaDescription": Conversion-focused search meta description (140-160 characters).
- "keywords": An array of 5 to 8 search keywords.

Example structure:
{
  "seoTitle": "Premium Diamond Necklaces | Brand Name",
  "metaDescription": "Discover our handcrafted diamond necklaces. Exquisite luxury jewelry perfect for weddings and anniversaries. Shop our exclusive catalog today.",
  "keywords": ["jewelry", "diamond", "necklace", "gold", "luxury"]
}
Do not wrap your output in markdown code blocks.`;

  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      seoTitle: `${name} | Premium Catalog Platform`,
      metaDescription: `Discover the best quality ${name} products and collections. Explore details, ratings, price ranges, and order online today.`,
      keywords: [name.toLowerCase().split(/\s+/)[0], 'catalog', 'shopping', 'luxury', 'online'],
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 300,
    });

    const text = completion.choices[0].message.content || '{}';
    return parseJSONResponse<SEOMetadata>(text, {
      seoTitle: `${name} | Catalog`,
      metaDescription: `Explore our collection of ${name}. Custom catalogs with full sizes, colors, and stock details.`,
      keywords: [],
    });
  } catch (err: any) {
    console.error('OpenAI generateSEOMetadata API call failed, falling back to simulation:', err.message);
    return {
      seoTitle: `${name} | Premium Catalog Platform`,
      metaDescription: `Discover the best quality ${name} products and collections. Explore details, ratings, price ranges, and order online today.`,
      keywords: [name.toLowerCase().split(/\s+/)[0], 'catalog', 'shopping', 'luxury', 'online'],
    };
  }
};

/**
 * 5. DALL-E 3 Image Generator
 * Generates an e-commerce/product image using DALL-E 3.
 */
export const generateAIImage = async (prompt: string): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required to generate an image.');
  }

  if (!openai) {
    throw new Error('OpenAI client is not configured (running in simulated fallback mode).');
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      n: 1,
      size: '1024x1024',
    });

    if (response && response.data && response.data[0]) {
      return response.data[0].url || '';
    }
    return '';
  } catch (err: any) {
    console.error('OpenAI generateAIImage API call failed:', err.message);
    throw new Error(`AI image generation failed: ${err.message}`);
  }
};

