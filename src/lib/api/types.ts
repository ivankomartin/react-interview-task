export type Packaging = "pet" | "can" | "glass" | "tetra" | "other";

export type Product = {
  id: number;
  companyId: number;
  registeredById: number;
  name: string;
  packaging: Packaging;
  deposit: number;
  volume: number;
  registeredAt: string;
  active: boolean;
};

export type Company = {
  id: number;
  name: string;
  registeredAt: string;
};

export type User = {
  id: number;
  companyId: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProductsResponse = {
  success: true;
  data: Product[];
  pagination: PaginationInfo;
};

export type CompaniesResponse = {
  success: true;
  data: Company[];
  total: number;
};

export type UsersResponse =
  | {
      success: true;
      data: User[];
      total: number;
    }
  | {
      success: false;
      error: string;
    };

export type ProductsQuery = {
  page?: number;
  limit?: number;
  active?: boolean;
  sort?: "name" | "registeredAt";
  order?: "asc" | "desc";
};

export type CreateProductBody = {
  name: string;
  packaging: Packaging;
  deposit: number;
  volume: number;
  companyId: number;
  registeredById: number;
};
