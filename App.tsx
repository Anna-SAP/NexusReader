import React, { useState, useEffect, useMemo } from 'react';
import { FEED_SOURCES } from './constants';
import { Article, ViewMode, SearchResult } from './types';
import { fetchAllFeeds } from './services/rssService';
import { semanticSearch, translateBatch } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ArticleCard from './components/ArticleCard';
import { Search, Menu, X, Moon, Sun, Loader2, Sparkles, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // --- State ---
  const [articles, setArticles] = useState<Article[]>([]);
  const [translatedCache, setTranslatedCache] = useState<Map<string, Article>>(new Map());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('today');
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // --- Effects ---

  // Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchAllFeeds(FEED_SOURCES);
      setArticles(data);
      setIsLoading(false);
    };
    loadData();

    // Load favorites from local storage
    const storedFavs = localStorage.getItem('nexus_favorites');
    if (storedFavs) {
      setFavorites(new Set(JSON.parse(storedFavs)));
    }

    // Check system dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('nexus_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Dark Mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Handlers ---

  const handleToggleFavorite = (article: Article) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(article.id)) {
      newFavs.delete(article.id);
    } else {
      newFavs.add(article.id);
    }
    setFavorites(newFavs);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    const results = await semanticSearch(searchQuery, articles);
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('nexus_language', newLang);
  };

  // --- Derived State (Filtering) ---

  const baseArticles = useMemo(() => {
    if (searchResults) return searchResults;

    let filtered = articles;

    switch (activeView) {
      case 'today':
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        filtered = articles.filter(a => a.timestamp > oneDayAgo);
        break;
      case 'favorites':
        filtered = articles.filter(a => favorites.has(a.id));
        break;
      case 'source':
        if (activeFeedId) {
          filtered = articles.filter(a => a.feedId === activeFeedId);
        }
        break;
      case 'all':
      default:
        // No filter
        break;
    }

    return filtered;
  }, [articles, activeView, activeFeedId, favorites, searchResults]);

  // --- Translation Effect ---
  // When language is ZH, translate the currently displayed baseArticles if not in cache
  useEffect(() => {
    const translateVisible = async () => {
      if (i18n.language !== 'zh' || baseArticles.length === 0) return;

      // Find items that need translation
      const itemsToTranslate = baseArticles.filter(
        a => !translatedCache.has(a.id)
      );

      if (itemsToTranslate.length === 0) return;

      setIsTranslating(true);
      
      // Process in batches of 10 to avoid token limits
      const BATCH_SIZE = 10;
      for (let i = 0; i < itemsToTranslate.length; i += BATCH_SIZE) {
         const batch = itemsToTranslate.slice(i, i + BATCH_SIZE);
         const translatedBatch = await translateBatch(batch);
         
         setTranslatedCache(prev => {
           const next = new Map(prev);
           translatedBatch.forEach(t => next.set(t.id, t));
           return next;
         });
      }

      setIsTranslating(false);
    };

    // Debounce slightly to avoid rapid toggling/scrolling calls
    const timer = setTimeout(translateVisible, 500);
    return () => clearTimeout(timer);
  }, [i18n.language, baseArticles]); // Dependency on baseArticles ensures we translate when view changes

  // Compute final articles to display (merging with translation cache if ZH)
  const finalDisplayArticles = useMemo(() => {
    if (i18n.language === 'en') return baseArticles;
    
    return baseArticles.map(a => translatedCache.get(a.id) || a);
  }, [baseArticles, translatedCache, i18n.language]);

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        sources={FEED_SOURCES}
        activeView={activeView}
        activeFeedId={activeFeedId}
        onViewChange={(view, id) => {
          setActiveView(view);
          if (id) setActiveFeedId(id);
          else setActiveFeedId(null);
          setSearchResults(null);
          setSearchQuery('');
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold dark:text-white capitalize hidden sm:block">
              {searchResults ? t('search_results') : activeView === 'source' ? FEED_SOURCES.find(f => f.id === activeFeedId)?.name : t(activeView === 'today' ? 'todays_updates' : activeView === 'all' ? 'all_feeds' : 'favorites')}
            </h2>
          </div>

          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center gap-2">
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'en' ? 'EN' : 'ZH'}</span>
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
                <p>{t('aggregating')}</p>
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Sparkles className="w-8 h-8 animate-pulse mb-4 text-brand-500" />
                <p>{t('finding')}</p>
              </div>
            ) : finalDisplayArticles.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-lg">{t('no_articles')}</p>
                {activeView === 'today' && <p className="text-sm mt-2">{t('try_viewing_all')}</p>}
              </div>
            ) : (
              <>
                {searchResults && (
                  <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-brand-800 dark:text-brand-300">{t('ai_search_active')}</h3>
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                        {t('ai_search_desc')}
                      </p>
                    </div>
                  </div>
                )}

                {isTranslating && (
                   <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 mb-4 flex items-center justify-center gap-2 animate-pulse">
                     <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                     <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('translating')}</p>
                   </div>
                )}
                
                <div className="grid gap-6">
                  {finalDisplayArticles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      isFavorite={favorites.has(article.id)}
                      onToggleFavorite={handleToggleFavorite}
                      similarity={(article as SearchResult).similarity}
                    />
                  ))}
                </div>
              </>
            )}

            {!isLoading && finalDisplayArticles.length > 0 && (
               <div className="py-8 text-center">
                 <p className="text-xs text-slate-400">{t('end_of_feed')}</p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;