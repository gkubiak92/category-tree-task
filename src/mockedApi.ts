import { INPUT } from './input';

export interface Category {
  id: number;
  name: string;
  hasChildren: boolean;
  url: string;
  Title: string;
  MetaTagDescription: string;
  children: Category[];
}

export type RequestFn = () => Promise<{ data: Category[] }>;

export const getCategories: RequestFn = async () => ({
  data: INPUT,
});
