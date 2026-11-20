// Typed API Client for BloomBiz Portfolio CMS

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProjectData {
  id?: number;
  slug: string;
  title: string;
  description: string;
  sector: string;
  scope: string;
  year: string;
  tone: string;
  problem: string;
  decision: string;
  principles: string[];
  result: string;
  external_url?: string;
  next_slug: string;
  next_title: string;
  next_tone: string;
  media: Array<{
    type: 'image' | 'video';
    src: string;
    poster?: string;
    alt: string;
    frame: string;
    layout: 'lead' | 'pair' | 'wide';
  }>;
  status: 'published' | 'draft';
  is_featured: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  mime_type: string;
  size: number;
  media_type: 'image' | 'video';
  project_slug: string | null;
  alt_text: string | null;
  created_at: string;
}

export interface SocialLinkItem {
  id: number;
  platform: string;
  url: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface ContactSettingsData {
  whatsapp_number: string;
  whatsapp_message: string;
  email: string;
  phone: string;
  enquiry_url: string;
  booking_url: string;
  address: string;
  timezone: string;
}

export interface SEOSettingsData {
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image: string;
  canonical_url: string;
  twitter_card: string;
}

export interface GeneralSettingsData {
  site_title: string;
  company_name: string;
  tagline: string;
  contact_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

export interface EnquiryItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message?: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  created_at: string;
}

export interface SummaryStats {
  projects: { total: number; published: number; drafts: number };
  media: { total: number; totalBytes: number; totalFormatted: string };
  socials: { total: number; active: number };
  enquiries: { new: number; total: number };
}

const TOKEN_KEY = 'bloombiz_admin_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Don't set Content-Type if FormData (e.g. file upload)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeToken();
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { username: string; password: string }) =>
      request<{ token: string; user: any; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    getMe: () => request<{ user: any }>('/api/auth/me'),
    logout: () =>
      request<{ message: string }>('/api/auth/logout', { method: 'POST' }).finally(() => {
        removeToken();
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Projects CRUD & Server Pagination
  projects: {
    list: (params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      category?: string;
      featured?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page.toString());
      if (params.limit) q.set('limit', params.limit.toString());
      if (params.search) q.set('search', params.search);
      if (params.status) q.set('status', params.status);
      if (params.category) q.set('category', params.category);
      if (params.featured) q.set('featured', params.featured);
      if (params.sortBy) q.set('sortBy', params.sortBy);
      if (params.sortOrder) q.set('sortOrder', params.sortOrder);
      return request<PaginatedResponse<ProjectData>>(`/api/projects?${q.toString()}`);
    },
    listAllPublished: () => request<ProjectData[]>('/api/projects/all'),
    getCategories: () => request<string[]>('/api/projects/categories'),
    get: (idOrSlug: string | number) => request<ProjectData>(`/api/projects/${idOrSlug}`),
    create: (data: Partial<ProjectData>) =>
      request<{ message: string; project: ProjectData }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: number, data: Partial<ProjectData>) =>
      request<{ message: string; project: ProjectData }>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number) =>
      request<{ message: string; id: number }>(`/api/projects/${id}`, {
        method: 'DELETE'
      }),
    duplicate: (id: number) =>
      request<{ message: string; project: ProjectData }>(`/api/projects/${id}/duplicate`, {
        method: 'POST'
      }),
    toggleStatus: (id: number, status?: 'published' | 'draft') =>
      request<{ message: string; id: number; status: string }>(`/api/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    reorder: (items: Array<{ id: number; display_order: number }>) =>
      request<{ message: string }>('/api/projects/reorder/batch', {
        method: 'PUT',
        body: JSON.stringify({ items })
      })
  },

  // Media Library
  media: {
    list: (params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      project?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page.toString());
      if (params.limit) q.set('limit', params.limit.toString());
      if (params.search) q.set('search', params.search);
      if (params.type) q.set('type', params.type);
      if (params.project) q.set('project', params.project);
      if (params.sortBy) q.set('sortBy', params.sortBy);
      if (params.sortOrder) q.set('sortOrder', params.sortOrder);
      return request<PaginatedResponse<MediaItem>>(`/api/media?${q.toString()}`);
    },
    upload: (formData: FormData) =>
      request<{ message: string; files: MediaItem[] }>('/api/media/upload', {
        method: 'POST',
        body: formData
      }),
    update: (id: number, data: { alt_text?: string; project_slug?: string | null }) =>
      request<{ message: string; media: MediaItem }>(`/api/media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number) =>
      request<{ message: string; id: number }>(`/api/media/${id}`, {
        method: 'DELETE'
      })
  },

  // Social Links
  social: {
    list: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      if (params?.search) q.set('search', params.search);
      if (params?.status) q.set('status', params.status);
      return request<PaginatedResponse<SocialLinkItem>>(`/api/social-links?${q.toString()}`);
    },
    create: (data: Partial<SocialLinkItem>) =>
      request<{ message: string; social: SocialLinkItem }>('/api/social-links', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: number, data: Partial<SocialLinkItem>) =>
      request<{ message: string; social: SocialLinkItem }>(`/api/social-links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number) =>
      request<{ message: string; id: number }>(`/api/social-links/${id}`, {
        method: 'DELETE'
      }),
    toggle: (id: number) =>
      request<{ message: string; is_active: boolean }>(`/api/social-links/${id}/toggle`, {
        method: 'PATCH'
      }),
    reorder: (items: Array<{ id: number; display_order: number }>) =>
      request<{ message: string }>('/api/social-links/reorder/batch', {
        method: 'PUT',
        body: JSON.stringify({ items })
      })
  },

  // Contact Settings
  contact: {
    get: () => request<ContactSettingsData>('/api/contact-settings'),
    update: (data: Partial<ContactSettingsData>) =>
      request<{ message: string; settings: ContactSettingsData }>('/api/contact-settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Website Content
  content: {
    getAll: () => request<Record<string, any>>('/api/website-content'),
    getSection: (key: string) => request<{ key: string; content: any }> (`/api/website-content/${key}`),
    updateSection: (key: string, content: any) =>
      request<{ message: string; key: string; content: any }>(`/api/website-content/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      })
  },

  // SEO Settings
  seo: {
    get: () => request<SEOSettingsData>('/api/seo-settings'),
    update: (data: Partial<SEOSettingsData>) =>
      request<{ message: string; settings: SEOSettingsData }>('/api/seo-settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // General Settings & Stats
  settings: {
    get: () => request<GeneralSettingsData>('/api/general-settings'),
    update: (data: Partial<GeneralSettingsData>) =>
      request<{ message: string; settings: GeneralSettingsData }>('/api/general-settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getStats: () => request<SummaryStats>('/api/general-settings/stats/summary')
  },

  // Enquiries (Contact Submissions)
  enquiries: {
    list: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page.toString());
      if (params.limit) q.set('limit', params.limit.toString());
      if (params.search) q.set('search', params.search);
      if (params.status) q.set('status', params.status);
      return request<PaginatedResponse<EnquiryItem>>(`/api/enquiries?${q.toString()}`);
    },
    updateStatus: (id: number, status: string) =>
      request<{ message: string; id: number; status: string }>(`/api/enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    delete: (id: number) =>
      request<{ message: string; id: number }>(`/api/enquiries/${id}`, {
        method: 'DELETE'
      }),
    submit: (data: { name: string; email: string; phone?: string; service?: string; budget?: string; message?: string }) =>
      request<{ message: string; id: number }>('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }
};
