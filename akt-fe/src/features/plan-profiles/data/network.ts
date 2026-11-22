export function isValidIpv4(value: string) {
  const parts = value.trim().split(".");
  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) {
      return false;
    }
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}

export function ipToNumber(value: string) {
  return value
    .trim()
    .split(".")
    .reduce((total, part) => total * 256 + Number(part), 0);
}

export function suggestLocalAddress(rangeStart: string) {
  const parts = rangeStart.trim().split(".");
  if (parts.length !== 4) {
    return "";
  }

  return `${parts[0]}.${parts[1]}.${parts[2]}.1`;
}
