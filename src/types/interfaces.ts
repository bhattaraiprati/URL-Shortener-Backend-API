export interface Url {
  id?: number;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at?: string;
}

export interface ClickRecord {
  id?: number;
  short_code: string;
  clicked_at?: string;
  ip?: string;
  user_agent?: string;
}

export interface RateLimitData {
  count: number;
  windowStart: number;
}