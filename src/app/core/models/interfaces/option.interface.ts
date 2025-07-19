export interface Option {
  companyId?: string;
  id?: string;
  name?: string;
  code?: string;
  active?: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  region_id?: number;
}

export interface VisualOption extends Option {
  color?: string;
  imageUrl?: string;
  selected?: boolean;
}