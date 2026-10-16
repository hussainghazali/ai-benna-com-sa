import { apiClient } from "@/lib/api-client";

const vendorNameCache: Record<string, string> = {};

export const resolveVendorName = async (vendorId: string): Promise<string> => {
  if (!vendorId) return "Unknown Vendor";
  if (vendorNameCache[vendorId]) return vendorNameCache[vendorId];

  try {
    const response = await apiClient<{
      data?: { fullName?: string; storeName?: string };
    }>(`/users/website/vendor/profile/${vendorId}`);
    const name =
      response?.data?.storeName ||
      response?.data?.fullName ||
      `Vendor ${vendorId.slice(-6)}`;
    vendorNameCache[vendorId] = name;
    return name;
  } catch {
    const fallback = `Vendor ${vendorId.slice(-6)}`;
    vendorNameCache[vendorId] = fallback;
    return fallback;
  }
};
