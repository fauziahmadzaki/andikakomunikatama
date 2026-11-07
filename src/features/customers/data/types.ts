export type CustomerStatus = "active" | "suspended" | "inactive" | "draft";
export type CustomerType = "residential" | "business";

export type Customer = {
  id: string;
  customerNumber: string;
  fullName: string;
  customerType: CustomerType;
  status: CustomerStatus;
  branchId: string;
  branchName: string;
  planId: string;
  planName: string;
  monthlyFee: number;
  phone: string;
  email: string;
  nik: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  salesName: string;
  dueDay: number;
  registeredAt: string;
  subscriptionStatus: "active" | "suspended" | "terminated" | "draft";
  outstanding: number;
  notes: string;
};

export type CustomerSegment = {
  id: string;
  name: string;
  description: string;
  filterLabel: string;
  count: number;
  createdAt: string;
};

export type PlanOption = {
  id: string;
  name: string;
  price: number;
  connectionType: string;
};

export type CustomerDraft = {
  id: string;
  data: Partial<Customer>;
  step: number;
  updatedAt: string;
};

export type ImportRow = {
  row: number;
  name: string;
  phone: string;
  nik: string;
  branchName: string;
  planName: string;
  status: "valid" | "warning" | "error";
  message: string;
};

export type CustomerInvoice = {
  id: string;
  customerId: string;
  number: string;
  period: string;
  dueDate: string;
  total: number;
  status: "paid" | "partial" | "overdue" | "issued";
};

export type CustomerTicket = {
  id: string;
  customerId: string;
  number: string;
  category: string;
  status: "open" | "in_progress" | "closed";
  createdAt: string;
  technician: string;
};

export type CustomerService = {
  id: string;
  customerId: string;
  serviceType: string;
  username: string;
  router: string;
  odp: string;
  status: "active" | "suspended" | "pending";
};
