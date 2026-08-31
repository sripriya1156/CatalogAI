const testFlickr = async () => {
  const tag = 'sarees';
  const url = `https://www.flickr.com/services/feeds/photos_public.gne?tags=${tag}&format=json&nojsoncallback=1`;

  console.log('Fetching Flickr feed from:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data: any = await response.json();
    console.log('Flickr success! Items count:', data?.items?.length);
    if (data?.items?.length > 0) {
      const firstItem = data.items[0];
      console.log('First item title:', firstItem.title);
      console.log('First item media URL:', firstItem.media?.m);
      
      // Flickr media m is small, but we can replace '_m' with '_b' to get a high-res image URL!
      const highResUrl = firstItem.media?.m.replace('_m.', '_b.');
      console.log('High-res media URL:', highResUrl);
    }
  } catch (error: any) {
    console.error('Flickr failed:', error.message || error);
  }
};

testFlickr();
