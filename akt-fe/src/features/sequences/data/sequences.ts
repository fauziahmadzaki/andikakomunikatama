export type NumberSequence = {
  id: string;
  key: string;
  label: string;
  prefix: string;
  nextNumber: number;
  padding: number;
  resetPolicy: "yearly" | "monthly" | "never";
};

export const seedSequences: NumberSequence[] = [
  {
    id: "seq-customer",
    key: "customer",
    label: "Nomor pelanggan",
    prefix: "CUS",
    nextNumber: 1285,
    padding: 6,
    resetPolicy: "yearly",
  },
  {
    id: "seq-invoice",
    key: "invoice",
    label: "Nomor invoice",
    prefix: "INV",
    nextNumber: 8421,
    padding: 6,
    resetPolicy: "yearly",
  },
  {
    id: "seq-payment",
    key: "payment",
    label: "Nomor pembayaran",
    prefix: "PAY",
    nextNumber: 6320,
    padding: 6,
    resetPolicy: "yearly",
  },
  {
    id: "seq-ticket",
    key: "ticket",
    label: "Nomor tiket",
    prefix: "TKT",
    nextNumber: 1874,
    padding: 6,
    resetPolicy: "yearly",
  },
  {
    id: "seq-journal",
    key: "journal",
    label: "Nomor jurnal",
    prefix: "JE",
    nextNumber: 902,
    padding: 6,
    resetPolicy: "yearly",
  },
  {
    id: "seq-po",
    key: "purchase_order",
    label: "Nomor purchase order",
    prefix: "PO",
    nextNumber: 148,
    padding: 5,
    resetPolicy: "yearly",
  },
];
