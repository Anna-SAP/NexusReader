import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Nexus",
      "overview": "Overview",
      "todays_updates": "Today's Updates",
      "favorites": "Favorites",
      "all_feeds": "All Feeds",
      "sources": "Sources",
      "search_placeholder": "Semantic search (e.g. 'react state management')...",
      "search_results": "Search Results",
      "ai_search_active": "AI Search Active",
      "ai_search_desc": "Displaying results based on semantic meaning, not just keywords.",
      "read_article": "Read Article",
      "aggregating": "Aggregating feeds...",
      "finding": "Finding semantically relevant articles...",
      "no_articles": "No articles found.",
      "try_viewing_all": "Try viewing \"All Feeds\" to see older posts.",
      "end_of_feed": "You've reached the end of the feed.",
      "translating": "Translating content with AI...",
      "powered_by": "Powered by Gemini & React",
      "match": "match"
    }
  },
  zh: {
    translation: {
      "app_title": "Nexus",
      "overview": "概览",
      "todays_updates": "今日快讯",
      "favorites": "收藏夹",
      "all_feeds": "所有订阅",
      "sources": "订阅源",
      "search_placeholder": "语义搜索（例如 'React 状态管理'）...",
      "search_results": "搜索结果",
      "ai_search_active": "AI 搜索已启用",
      "ai_search_desc": "基于语义含义展示结果，而非仅关键词匹配。",
      "read_article": "阅读原文",
      "aggregating": "正在聚合订阅源...",
      "finding": "正在查找相关文章...",
      "no_articles": "暂无文章。",
      "try_viewing_all": "尝试查看“所有订阅”以获取更早的文章。",
      "end_of_feed": "已到达底部。",
      "translating": "正在使用 AI 翻译内容...",
      "powered_by": "由 Gemini & React 驱动",
      "match": "匹配度"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('nexus_language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;