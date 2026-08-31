const extractKeywordsLocal = (prompt: string): string[] => {
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

const getFlickrImage = async (prompt: string, category: string) => {
  const keywords = extractKeywordsLocal(prompt || '');
  if (category) {
    keywords.push(category.toLowerCase().replace(/\s+/g, ''));
  }
  const searchTerms = keywords.length > 0 ? keywords.slice(0, 3).join(',') : 'product';
  const url = `https://www.flickr.com/services/feeds/photos_public.gne?tags=${searchTerms}&format=json&nojsoncallback=1`;

  console.log(`Searching Flickr for query: "${prompt}" (tags: "${searchTerms}")...`);
  try {
    const response = await fetch(url);
    const data: any = await response.json();
    if (data?.items && data.items.length > 0) {
      console.log(`Success! Found ${data.items.length} images.`);
      console.log('Top match title:', data.items[0].title);
      console.log('Top match URL:', data.items[0].media?.m.replace('_m.', '_b.'));
    } else {
      console.log('No images found on Flickr feed.');
    }
  } catch (err: any) {
    console.error('Flickr search failed:', err.message);
  }
  console.log('----------------------------------------');
};

const test = async () => {
  await getFlickrImage('blue silk saree', 'clothing');
  await getFlickrImage('shiny gold diamond ring', 'jewelry');
  await getFlickrImage('premium brown leather bag', 'handbag');
  await getFlickrImage('nike running shoes', 'footwear');
};

test();
