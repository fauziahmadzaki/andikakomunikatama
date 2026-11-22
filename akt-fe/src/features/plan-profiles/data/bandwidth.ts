export type BandwidthPreview = {
  ratio: number;
  mirDownloadMbps: number;
  mirUploadMbps: number;
  cirDownloadMbps: number;
  cirUploadMbps: number;
  burstDownloadMbps: number;
  burstUploadMbps: number;
  rateLimit: string;
};

export const oversubRatioOptions = [
  { value: "2", label: "1 : 2" },
  { value: "4", label: "1 : 4" },
  { value: "5", label: "1 : 5" },
  { value: "8", label: "1 : 8" },
  { value: "10", label: "1 : 10" },
  { value: "20", label: "1 : 20" },
  { value: "32", label: "1 : 32" },
];

export const defaultOversubRatio = "5";

export function formatBandwidth(value: number) {
  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value)} Mbps`;
}

/**
 * Formats a Mbps value for MikroTik rate-limit strings.
 * Decimals are converted to kbps so values like 2.5 Mbps become 2500k.
 */
export function formatRateLimit(valueMbps: number) {
  if (Number.isInteger(valueMbps)) {
    return `${valueMbps}m`;
  }
  return `${Math.round(valueMbps * 1000)}k`;
}

export function computeBandwidth({
  downloadMbps,
  uploadMbps,
  oversubscription,
  oversubRatio,
}: {
  downloadMbps: number;
  uploadMbps: number;
  oversubscription: boolean;
  oversubRatio: number;
}): BandwidthPreview {
  const ratio = oversubscription ? Math.max(1, oversubRatio) : 1;
  const mirDownloadMbps = downloadMbps;
  const mirUploadMbps = uploadMbps;
  const cirDownloadMbps = mirDownloadMbps / ratio;
  const cirUploadMbps = mirUploadMbps / ratio;
  const burstDownloadMbps = mirDownloadMbps;
  const burstUploadMbps = mirUploadMbps;

  // MikroTik order: rx/tx = upload/download.
  // CIR is included as rx-rate-min/tx-rate-min at the end.
  const rateLimit = [
    `${formatRateLimit(mirUploadMbps)}/${formatRateLimit(mirDownloadMbps)}`,
    `${formatRateLimit(burstUploadMbps)}/${formatRateLimit(burstDownloadMbps)}`,
    "0/0",
    "0/0",
    "0/0",
    "8",
    `${formatRateLimit(cirUploadMbps)}/${formatRateLimit(cirDownloadMbps)}`,
  ].join(" ");

  return {
    ratio,
    mirDownloadMbps,
    mirUploadMbps,
    cirDownloadMbps,
    cirUploadMbps,
    burstDownloadMbps,
    burstUploadMbps,
    rateLimit,
  };
}
