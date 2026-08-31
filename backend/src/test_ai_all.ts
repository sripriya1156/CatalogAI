import dotenv from 'dotenv';
dotenv.config();

import {
  generateAIDescription,
  generateAITags,
  generateAISEOMetadata
} from './services/openaiService';

const testAll = async () => {
  console.log('Testing description generator...');
  try {
    const desc = await generateAIDescription('Gold Ring', 'Jewellery', ['handmade', '18k']);
    console.log('Description Success:', desc);
  } catch (err: any) {
    console.error('Description Failed:', err.message);
  }

  console.log('Testing tags generator...');
  try {
    const tags = await generateAITags('Gold Ring', 'Beautiful handmade 18k gold wedding ring for brides.');
    console.log('Tags Success:', tags);
  } catch (err: any) {
    console.error('Tags Failed:', err.message);
  }

  console.log('Testing SEO metadata generator...');
  try {
    const seo = await generateAISEOMetadata('Gold Ring', 'Beautiful handmade 18k gold wedding ring for brides.');
    console.log('SEO Success:', seo);
  } catch (err: any) {
    console.error('SEO Failed:', err.message);
  }
};

testAll();
