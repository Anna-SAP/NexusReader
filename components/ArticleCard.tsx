import React from 'react';
import { Article } from '../types';
import { Star, ExternalLink, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ArticleCardProps {
  article: Article;
  isFavorite: boolean;
  onToggleFavorite: (article: Article) => void;
  similarity?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isFavorite, onToggleFavorite, similarity }) => {
  const { t, i18n } = useTranslation();
  
  const date = new Date(article.pubDate).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-brand-500/30">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {article.feedName}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {date}
          </span>
          {similarity && (
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded ml-2 normal-case">
              {Math.round(similarity * 100)}% {t('match')}
            </span>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(article);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isFavorite 
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <a 
        href={article.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
      >
        <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
          {article.title}
        </h3>
      </a>

      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-3">
        {article.contentSnippet}
      </p>

      <div className="flex items-center justify-end">
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {t('read_article')} <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;