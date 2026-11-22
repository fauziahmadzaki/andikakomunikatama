export type Branch = {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  isHeadOffice: boolean;
  isActive: boolean;
  customerCount: number;
};

export const seedBranches: Branch[] = [
  {
    id: "br-jkt",
    code: "JKT-01",
    name: "Jakarta Pusat",
    phone: "+62 21 5550 1234",
    address: "Jl. Jend. Sudirman No. 21, Jakarta Pusat",
    isHeadOffice: true,
    isActive: true,
    customerCount: 642,
  },
  {
    id: "br-bdg",
    code: "BDG-01",
    name: "Bandung",
    phone: "+62 22 4200 8899",
    address: "Jl. Asia Afrika No. 88, Bandung",
    isHeadOffice: false,
    isActive: true,
    customerCount: 318,
  },
  {
    id: "br-sby",
    code: "SBY-01",
    name: "Surabaya",
    phone: "+62 31 9900 7711",
    address: "Jl. Basuki Rahmat No. 45, Surabaya",
    isHeadOffice: false,
    isActive: true,
    customerCount: 224,
  },
  {
    id: "br-mdn",
    code: "MDN-01",
    name: "Medan",
    phone: "+62 61 8800 5522",
    address: "Jl. Gatot Subroto No. 12, Medan",
    isHeadOffice: false,
    isActive: false,
    customerCount: 64,
  },
];
