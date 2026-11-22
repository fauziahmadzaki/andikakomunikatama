const REGION_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export type Region = {
  id: string;
  name: string;
};

export type ReverseGeocodeResult = {
  addressLine?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  postalCode?: string;
  provinceCandidates?: string[];
  cityCandidates?: string[];
  districtCandidates?: string[];
  villageCandidates?: string[];
};

type NominatimAddress = {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  county?: string;
  city_district?: string;
  district?: string;
  state?: string;
  postcode?: string;
};

async function fetchRegion(path: string): Promise<Region[]> {
  try {
    const response = await fetch(`${REGION_BASE}/${path}`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .map((item) => {
        const record = item as { id?: string; name?: string };
        return record.id && record.name
          ? { id: String(record.id), name: String(record.name) }
          : null;
      })
      .filter((item): item is Region => Boolean(item));
  } catch {
    return [];
  }
}

export function fetchProvinces() {
  return fetchRegion("provinces.json");
}

export function fetchRegencies(provinceId: string) {
  return fetchRegion(`regencies/${provinceId}.json`);
}

export function fetchDistricts(regencyId: string) {
  return fetchRegion(`districts/${regencyId}.json`);
}

export function fetchVillages(districtId: string) {
  return fetchRegion(`villages/${districtId}.json`);
}

export function normalizeRegionName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/daerahkhususibukota/g, "dki")
    .replace(/daerahistimewa/g, "di")
    .replace(/^(provinsi|propinsi|kotaadministrasi|kota|kabupaten|kab)/, "");
}

export function matchRegion(regions: Region[], candidates: string[]) {
  const normalizedCandidates = candidates
    .map(normalizeRegionName)
    .filter(Boolean);

  if (normalizedCandidates.length === 0) {
    return undefined;
  }

  for (const candidate of normalizedCandidates) {
    const exact = regions.find(
      (region) => normalizeRegionName(region.name) === candidate
    );
    if (exact) {
      return exact;
    }
  }

  for (const candidate of normalizedCandidates) {
    const partial = regions.find((region) => {
      const normalized = normalizeRegionName(region.name);
      return normalized.includes(candidate) || candidate.includes(normalized);
    });
    if (partial) {
      return partial;
    }
  }

  return undefined;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
    "accept-language": "id",
  });

  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/reverse?${params.toString()}`,
      {
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) {
      return {};
    }
    const data = (await response.json()) as {
      address?: NominatimAddress;
    };
    const address = data.address ?? {};
    const street = [address.road, address.house_number]
      .filter(Boolean)
      .join(" ");
    const compact = (values: Array<string | undefined>) =>
      values.filter((value): value is string => Boolean(value));

    return {
      addressLine: street || address.neighbourhood || address.suburb,
      province: address.state,
      city:
        address.city_district ??
        address.city ??
        address.town ??
        address.municipality ??
        address.county,
      district:
        address.suburb ??
        address.district ??
        address.city_district ??
        address.town ??
        address.county,
      village:
        address.village ??
        address.neighbourhood ??
        address.suburb ??
        address.town ??
        address.city,
      postalCode: address.postcode,
      provinceCandidates: compact([
        address.state,
        address.city,
        address.county,
      ]),
      cityCandidates: compact([
        address.city_district,
        address.city,
        address.town,
        address.municipality,
        address.county,
      ]),
      districtCandidates: compact([
        address.suburb,
        address.district,
        address.city_district,
        address.town,
        address.county,
      ]),
      villageCandidates: compact([
        address.village,
        address.neighbourhood,
        address.suburb,
        address.city_district,
      ]),
    };
  } catch {
    return {};
  }
}
