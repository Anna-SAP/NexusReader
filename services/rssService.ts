import { Article, FeedSource } from '../types';
import { CORS_PROXY } from '../constants';

export const fetchFeed = async (source: FeedSource): Promise<Article[]> => {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(source.url)}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      // Silently fail for individual feeds to allow others to load
      console.warn(`RSS2JSON Error for ${source.name}: ${data.message}`);
      return [];
    }

    // Limit to latest 10 per feed for performance in this demo
    return data.items.slice(0, 10).map((item: any) => {
      // Create a snippet from description or content (RSS2JSON provides these fields)
      // Remove HTML tags to get plain text snippet
      const rawContent = item.description || item.content || "";
      const contentSnippet = rawContent.replace(/<[^>]*>?/gm, '').substring(0, 200) + (rawContent.length > 200 ? '...' : '');

      // RSS2JSON typically returns dates in "YYYY-MM-DD HH:mm:ss" format
      // Replace space with T to ensure ISO format compatibility for Date parsing
      const pubDateStr = item.pubDate ? item.pubDate.replace(' ', 'T') : new Date().toISOString();
      let pubDate = new Date(pubDateStr);
      
      // Fallback if date parsing fails
      if (isNaN(pubDate.getTime())) {
        pubDate = new Date();
      }

      return {
        // Use link as ID source, handle potential unique identifiers if provided by API
        id: btoa(unescape(encodeURIComponent(item.link || Math.random().toString()))),
        feedId: source.id,
        feedName: source.name,
        title: item.title,
        link: item.link,
        contentSnippet,
        pubDate: pubDate.toISOString(),
        timestamp: pubDate.getTime(),
      };
    });
  } catch (error) {
    console.error(`Error fetching feed ${source.name}:`, error);
    return [];
  }
};

export const fetchAllFeeds = async (sources: FeedSource[]): Promise<Article[]> => {
  const promises = sources.map(source => fetchFeed(source));
  const results = await Promise.all(promises);
  return results.flat().sort((a, b) => b.timestamp - a.timestamp);
};