export type ChangeCategory = "feature" | "legal" | "ui" | "fix" | "performance" | "maintenance";

export interface CategoryGroup {
  category: ChangeCategory;
  categoryLabel: string;
  icon?: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  isCurrent?: boolean;
  summary: string;
  categories: CategoryGroup[];
}
