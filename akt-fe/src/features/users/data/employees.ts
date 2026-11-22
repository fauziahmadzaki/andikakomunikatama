export type EmployeeStatus = "active" | "inactive";

export type Employee = {
  id: string;
  userId?: string;
  branchId: string;
  employeeNumber: string;
  fullName: string;
  phone: string;
  position: string;
  status: EmployeeStatus;
};

export const seedEmployees: Employee[] = [
  {
    id: "emp-rina",
    userId: "usr-rina",
    branchId: "br-jkt",
    employeeNumber: "EMP-0001",
    fullName: "Rina Sales",
    phone: "+62 812 1000 0001",
    position: "Sales",
    status: "active",
  },
  {
    id: "emp-dewi",
    userId: "usr-dewi",
    branchId: "br-bdg",
    employeeNumber: "EMP-0002",
    fullName: "Dewi Lestari",
    phone: "+62 812 1000 0002",
    position: "Sales",
    status: "active",
  },
  {
    id: "emp-bayu",
    userId: "usr-bayu",
    branchId: "br-sby",
    employeeNumber: "EMP-0003",
    fullName: "Bayu Pratama",
    phone: "+62 812 1000 0003",
    position: "Sales",
    status: "inactive",
  },
  {
    id: "emp-noc",
    userId: "usr-teknisi",
    branchId: "br-bdg",
    employeeNumber: "EMP-0004",
    fullName: "Teknisi NOC",
    phone: "+62 812 1000 0004",
    position: "Teknisi",
    status: "active",
  },
  {
    id: "emp-warehouse",
    branchId: "br-jkt",
    employeeNumber: "EMP-0005",
    fullName: "Admin Gudang",
    phone: "+62 812 1000 0005",
    position: "Gudang",
    status: "active",
  },
];
