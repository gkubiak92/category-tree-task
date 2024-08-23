import { Category, RequestFn } from './mockedApi';

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

/*
 * Get order number from category title, if it's not a number, return id
 * Also while parsing, make sure that radix is 10 to avoid weird issues if value in Title is e.g. 0x123
 */
export const getCategoryOrderNumber = (title: string, id: number) => {
  if (!title) return id;

  const order = parseInt(title, 10);

  return isNaN(order) ? id : order;
};

/*
 * Sort categories by order number
 */
export const sortCategoryListElements = (categories: CategoryListElement[]) =>
  categories.sort((a, b) => a.order - b.order);

const SHOW_ON_HOME_SYMBOL = '#';
const SHOW_ON_HOME_LIMIT = 5;
const SHOW_ON_HOME_FALLBACK_LIMIT = 3;

/*
 * Check if category should be shown on home page
 * Only allow top level categories to be shown on home page based on business logic
 */
export const shouldShowOnHome = (
  topLevelCategoriesLength: number,
  categoryIndex: number,
  categoryTitle: string,
  isTopLevel: boolean
) => {
  if (!isTopLevel) {
    return false;
  }

  return (
    topLevelCategoriesLength <= SHOW_ON_HOME_LIMIT ||
    categoryTitle.includes(SHOW_ON_HOME_SYMBOL) ||
    categoryIndex < SHOW_ON_HOME_FALLBACK_LIMIT
  );
};

export const transformCategoriesToList = (
  categories: Category[],
  isTopCategory = true
) =>
  categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    image: category.MetaTagDescription,
    order: getCategoryOrderNumber(category.Title, category.id),
    showOnHome: shouldShowOnHome(
      categories.length,
      index,
      category.Title,
      isTopCategory
    ),
    children: category.hasChildren
      ? sortCategoryListElements(
          transformCategoriesToList(category.children, false)
        )
      : [],
  }));

export const buildCategoryTree = async (requestFn: RequestFn) => {
  const res = await requestFn();

  if (!res.data) {
    return [];
  }

  return sortCategoryListElements(transformCategoriesToList(res.data));
};
