// front/generate-sitemap.cjs
// Using the 'sitemap' package

// Ensuring CommonJS syntax for .cjs file
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// Define your application's public static routes.
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/signup', changefreq: 'monthly', priority: 0.7 },
  { url: '/signin', changefreq: 'monthly', priority: 0.7 },
  { url: '/forgot-password', changefreq: 'yearly', priority: 0.5 },
  // Add other public static routes here
  // e.g., { url: '/about', changefreq: 'monthly', priority: 0.8 },
];

const main = async () => {
  try {
    console.log('Generating sitemap with "sitemap" package...');
    const sitemapStream = new SitemapStream({ hostname: 'https://www.befirstlearning.com' });

    // Define the path to save the sitemap.
    const sitemapPath = path.resolve(__dirname, 'public', 'sitemap.xml');

    // Create a write stream to the sitemap file
    const writeStream = createWriteStream(sitemapPath);

    // Pipe the sitemap stream to the file
    sitemapStream.pipe(writeStream);

    // Add links to the sitemap
    links.forEach(link => sitemapStream.write(link));
    sitemapStream.end();

    // Wait for the stream to finish
    await streamToPromise(sitemapStream); // This might be redundant if already piped and ended.
                                          // The primary purpose of streamToPromise is to get the XML string.
                                          // For file writing, ensuring the stream closes is key.

    // Alternative: collect XML and then write
    // const xml = await streamToPromise(sitemapStream).then(data => data.toString());
    // fs.writeFileSync(sitemapPath, xml);
    // links.forEach(link => sitemapStream.write(link)); // Call this before streamToPromise if using it to generate XML
    // sitemapStream.end();

    // Monitor when the write stream finishes
    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    console.log(`Sitemap generated successfully at ${sitemapPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1); // Exit with error code
  }
};

main();
