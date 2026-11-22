export type CompanyProfile = {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  invoicePrefix: string;
  logoUrl: string | null;
  bhpRate: number;
  usoRate: number;
  ispFeeRate: number;
};

export const seedCompany: CompanyProfile = {
  name: "MURANET",
  legalName: "PT Andika Komunika Tama",
  email: "halo@muranet.id",
  phone: "+62 21 5550 1234",
  address: "Jl. Jend. Sudirman No. 21, Jakarta Pusat",
  taxNumber: "01.234.567.8-901.000",
  invoicePrefix: "INV",
  logoUrl: null,
  bhpRate: 1.25,
  usoRate: 0.5,
  ispFeeRate: 3,
};
