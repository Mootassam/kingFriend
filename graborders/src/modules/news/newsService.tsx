import authAxios from 'src/modules/shared/axios/authAxios';

export type NewsCategory = 'forex' | 'crypto';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string | null;
  url: string;
  source: string;
  category: NewsCategory;
  publishedAt: string;
}

export interface NewsPage {
  rows: NewsArticle[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  updatedAt: string | null;
}

export default class NewsService {
  // Forex and crypto headlines gathered by the server from public news feeds (GET /api/news),
  // the same source as web2's /app/news page.
  static async list(params: {
    category: 'all' | NewsCategory;
    page: number;
    pageSize: number;
    search: string;
  }): Promise<NewsPage> {
    const response = await authAxios.get('/news', {
      params: {
        category: params.category === 'all' ? undefined : params.category,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
      },
    });
    return response.data;
  }
}
