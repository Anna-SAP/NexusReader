import React from 'react';
import { FeedSource, ViewMode } from '../types';
import { Layout, Calendar, Star, Rss, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  sources: FeedSource[];
  activeView: ViewMode;
  activeFeedId: string | null;
  onViewChange: (view: ViewMode, feedId?: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ sources, activeView, activeFeedId, onViewChange, isOpen }) => {
  const { t } = useTranslation();

  const navItemClass = (isActive: boolean) => `
    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer mb-1
    ${isActive 
      ? 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400' 
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
  `;

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center px-3 mb-8">
          <Layers className="w-6 h-6 text-brand-500 mr-2" />
          <h1 className="text-xl font-bold tracking-tight dark:text-white">{t('app_title')}</h1>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('overview')}
            </div>
            <div 
              className={navItemClass(activeView === 'today')}
              onClick={() => onViewChange('today')}
            >
              <Calendar className="w-4 h-4 mr-3" />
              {t('todays_updates')}
            </div>
            <div 
              className={navItemClass(activeView === 'favorites')}
              onClick={() => onViewChange('favorites')}
            >
              <Star className="w-4 h-4 mr-3" />
              {t('favorites')}
            </div>
            <div 
              className={navItemClass(activeView === 'all')}
              onClick={() => onViewChange('all')}
            >
              <Layout className="w-4 h-4 mr-3" />
              {t('all_feeds')}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>{t('sources')}</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 rounded text-[10px]">{sources.length}</span>
            </div>
            {sources.map(source => (
              <div 
                key={source.id}
                className={navItemClass(activeView === 'source' && activeFeedId === source.id)}
                onClick={() => onViewChange('source', source.id)}
              >
                <Rss className="w-3 h-3 mr-3 opacity-70" />
                <span className="truncate">{source.name}</span>
              </div>
            ))}
          </div>
        </nav>

        <div className="mt-auto px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            {t('powered_by')}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;