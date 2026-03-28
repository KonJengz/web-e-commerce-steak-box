export const DEFAULT_CATEGORY_DIRECTORY_SORT = "updated_desc" as const;
export const DEFAULT_CATEGORY_USAGE_FILTER = "all" as const;

export const CATEGORY_DIRECTORY_SORT_OPTIONS = [
  { label: "Recently updated", value: "updated_desc" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
  { label: "Most assigned", value: "assigned_desc" },
  { label: "Least assigned", value: "assigned_asc" },
] as const;

export const CATEGORY_USAGE_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "In Use", value: "in_use" },
  { label: "Unused", value: "unused" },
] as const;

export type CategoryDirectorySortValue =
  (typeof CATEGORY_DIRECTORY_SORT_OPTIONS)[number]["value"];

export type CategoryUsageFilterValue =
  (typeof CATEGORY_USAGE_FILTER_OPTIONS)[number]["value"];

const CATEGORY_DIRECTORY_SORT_SET = new Set<CategoryDirectorySortValue>(
  CATEGORY_DIRECTORY_SORT_OPTIONS.map((option) => option.value),
);

const CATEGORY_USAGE_FILTER_SET = new Set<CategoryUsageFilterValue>(
  CATEGORY_USAGE_FILTER_OPTIONS.map((option) => option.value),
);

export const isCategoryDirectorySortValue = (
  value: string,
): value is CategoryDirectorySortValue => {
  return CATEGORY_DIRECTORY_SORT_SET.has(value as CategoryDirectorySortValue);
};

export const isCategoryUsageFilterValue = (
  value: string,
): value is CategoryUsageFilterValue => {
  return CATEGORY_USAGE_FILTER_SET.has(value as CategoryUsageFilterValue);
};

export const normalizeCategoryDirectorySort = (
  value: string,
): CategoryDirectorySortValue => {
  return isCategoryDirectorySortValue(value)
    ? value
    : DEFAULT_CATEGORY_DIRECTORY_SORT;
};

export const normalizeCategoryUsageFilter = (
  value: string,
): CategoryUsageFilterValue => {
  return isCategoryUsageFilterValue(value)
    ? value
    : DEFAULT_CATEGORY_USAGE_FILTER;
};
