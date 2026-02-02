import { FeedSource } from './types';

// Curated list of high-quality tech/programming feeds
export const FEED_SOURCES: FeedSource[] = [
  { id: '1', name: 'Joel on Software', url: 'https://www.joelonsoftware.com/feed/', category: 'programming' },
  { id: '2', name: 'Coding Horror', url: 'https://blog.codinghorror.com/rss/', category: 'programming' },
  { id: '3', name: 'Paul Graham', url: 'http://www.aaronsw.com/2002/feeds/pgessays.rss', category: 'tech' },
  { id: '4', name: 'Dan Luu', url: 'https://danluu.com/atom.xml', category: 'tech' },
  { id: '5', name: 'A List Apart', url: 'https://alistapart.com/main/feed/', category: 'tech' },
  { id: '6', name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', category: 'programming' },
  { id: '7', name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', category: 'tech' },
  { id: '8', name: 'Hacker News (Top)', url: 'https://hnrss.org/newest?points=100', category: 'tech' }
];

export const CORS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';