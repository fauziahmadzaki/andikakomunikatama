export interface ComputedBandwidth {
  oversubRatio: number;
  mirDownloadMbps: number;
  mirUploadMbps: number;
  cirDownloadMbps: number;
  cirUploadMbps: number;
  burstDownloadMbps: number;
  burstUploadMbps: number;
  rateLimit: string;
}

export function isValidIpv4(value: string): boolean {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}

export function ipToNumber(value: string): number {
  return value
    .trim()
    .split('.')
    .reduce((total, part) => total * 256 + Number(part), 0);
}

function formatRateLimit(valueMbps: number): string {
  if (Number.isInteger(valueMbps)) {
    return `${valueMbps}m`;
  }
  return `${Math.round(valueMbps * 1000)}k`;
}

export function computeBandwidth(input: {
  downloadMbps: number;
  uploadMbps: number;
  oversubscription: boolean;
  oversubRatio: number;
}): ComputedBandwidth {
  const ratio = input.oversubscription ? Math.max(1, input.oversubRatio) : 1;
  const mirDownloadMbps = input.downloadMbps;
  const mirUploadMbps = input.uploadMbps;
  const cirDownloadMbps = mirDownloadMbps / ratio;
  const cirUploadMbps = mirUploadMbps / ratio;
  const burstDownloadMbps = mirDownloadMbps;
  const burstUploadMbps = mirUploadMbps;

  const rateLimit = [
    `${formatRateLimit(mirUploadMbps)}/${formatRateLimit(mirDownloadMbps)}`,
    `${formatRateLimit(burstUploadMbps)}/${formatRateLimit(burstDownloadMbps)}`,
    '0/0',
    '0/0',
    '0/0',
    '8',
    `${formatRateLimit(cirUploadMbps)}/${formatRateLimit(cirDownloadMbps)}`,
  ].join(' ');

  return {
    oversubRatio: ratio,
    mirDownloadMbps,
    mirUploadMbps,
    cirDownloadMbps,
    cirUploadMbps,
    burstDownloadMbps,
    burstUploadMbps,
    rateLimit,
  };
}
