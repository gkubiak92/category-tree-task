import test from 'ava';

import { CORRECT } from './correctResult';
import { Category, getCategories } from './mockedApi';
import {
  buildCategoryTree,
  CategoryListElement,
  getCategoryOrderNumber,
  shouldShowOnHome,
  sortCategoryListElements,
  transformCategoriesToList,
} from './task';

/*
 * getCategoryOrderNumber tests
 */

const getCategoryOrderNumberTestCases = [
  { Title: '1', id: 100, expected: 1 },
  { Title: '', id: 100, expected: 100 },
  { Title: '0x123', id: 100, expected: 0 },
  { Title: '2137superCategory', id: 100, expected: 2137 },
  { Title: 'UberCategory', id: 100, expected: 100 },
  { Title: '05', id: 100, expected: 5 },
];

getCategoryOrderNumberTestCases.forEach(({ Title, id, expected }) => {
  test(`returns ${expected} for ${Title} and id ${id}`, (t) => {
    t.is(getCategoryOrderNumber(Title, id), expected);
  });
});

/*
 * sortCategoryListElements tests
 */

test('sorts categories by order number properly', async (t) => {
  const categories: CategoryListElement[] = [
    { id: 2, name: '2', order: 2, image: '', children: [], showOnHome: false },
    { id: 1, name: '1', order: 1, image: '', children: [], showOnHome: false },
    { id: 3, name: '3', order: 3, image: '', children: [], showOnHome: false },
    { id: 7, name: '7', order: 7, image: '', children: [], showOnHome: false },
  ];

  const sortedCategories = sortCategoryListElements(categories);

  t.deepEqual(sortedCategories, [
    { id: 1, name: '1', order: 1, image: '', children: [], showOnHome: false },
    { id: 2, name: '2', order: 2, image: '', children: [], showOnHome: false },
    { id: 3, name: '3', order: 3, image: '', children: [], showOnHome: false },
    { id: 7, name: '7', order: 7, image: '', children: [], showOnHome: false },
  ]);
});

/*
 * shouldShowOnHome tests
 */

const shouldShowOnHomeTestCases = [
  {
    topLevelCategoriesLength: 5,
    categoryIndex: 1,
    categoryTitle: 'Top level category',
    isTopLevel: true,
    expected: true,
  },
  {
    topLevelCategoriesLength: 5,
    categoryIndex: 1,
    categoryTitle: 'Nested category',
    isTopLevel: false,
    expected: false,
  },
  {
    topLevelCategoriesLength: 10,
    categoryIndex: 1,
    categoryTitle: 'Top level category with#',
    isTopLevel: true,
    expected: true,
  },
  {
    topLevelCategoriesLength: 10,
    categoryIndex: 1,
    categoryTitle:
      'Top level category without hash but with index less than SHOW_ON_HOME_FALLBACK_LIMIT',
    isTopLevel: true,
    expected: true,
  },
  {
    topLevelCategoriesLength: 10,
    categoryIndex: 5,
    categoryTitle:
      'Top level category without hash and with index greater than SHOW_ON_HOME_FALLBACK_LIMIT',
    isTopLevel: true,
    expected: false,
  },
];

shouldShowOnHomeTestCases.forEach(
  ({
    topLevelCategoriesLength,
    categoryIndex,
    categoryTitle,
    isTopLevel,
    expected,
  }) => {
    test(`returns ${expected} for shouldShowOnHome with arguments topLevelCategoriesLength ${topLevelCategoriesLength}, categoryIndex ${categoryIndex}, categoryTitle ${categoryTitle} and isTopLevel ${isTopLevel}`, (t) => {
      t.is(
        shouldShowOnHome(
          topLevelCategoriesLength,
          categoryIndex,
          categoryTitle,
          isTopLevel
        ),
        expected
      );
    });
  }
);

/*
 * transformCategoriesToList tests
 */

const transformCategoriesToListTestCases = [
  {
    categories: [
      {
        id: 1,
        name: '1',
        MetaTagDescription: 'First',
        Title: '1#',
        hasChildren: true,
        children: [
          {
            id: 11,
            name: '11',
            MetaTagDescription: 'First Nested',
            Title: '11',
            hasChildren: false,
            children: [],
            url: 'https://example.com/1/11',
          },
        ],
        url: 'https://example.com/1',
        showOnHome: true,
      },
    ],
    isTopCategory: true,
    expected: [
      {
        id: 1,
        name: '1',
        image: 'First',
        order: 1,
        showOnHome: true,
        children: [
          {
            id: 11,
            name: '11',
            image: 'First Nested',
            order: 11,
            showOnHome: false,
            children: [],
          },
        ],
      },
    ],
  },
];

transformCategoriesToListTestCases.forEach(
  ({ categories, isTopCategory, expected }) => {
    test(`returns ${expected} for transformCategoriesToList with arguments categories ${categories} and isTopCategory ${isTopCategory}`, (t) => {
      t.deepEqual(
        transformCategoriesToList(categories, isTopCategory),
        expected
      );
    });
  }
);

/*
 * buildCategoryTree tests
 */

test('returns an empty array if no categories are found', async (t) => {
  const emptyRequest = () =>
    new Promise<{ data: Category[] }>((resolve) => resolve({ data: [] }));

  const result = await buildCategoryTree(() => emptyRequest());

  t.is(result.length, 0);
});

test('returns correct buildCategoryTree result', async (t) => {
  const result = await buildCategoryTree(() => getCategories());

  t.deepEqual(result, CORRECT);
});
