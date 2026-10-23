export interface IPageBreadcrumb {
  label: string;
  link?: string;
  next?: IPageBreadcrumb;
}

export interface PageBreadcrumbsProps {
  breadcrumb: IPageBreadcrumb;
  isLoading?: boolean;
}

export interface PageBreadcrumbsSkeletonProps {
  itemsCount?: number;
}
