export interface FilterOption {
  name: string;
  value: string;
  icon?: string;
  count?: number;
  checked?: boolean;
}

export interface FilterCategory {
  title: string;
  type: 'radio' | 'checkbox' | 'text' | 'icon';
  options: FilterOption[];
  icon?: string;
}
