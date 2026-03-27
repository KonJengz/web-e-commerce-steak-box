import "server-only";

import type { CreateAddressInput } from "@/features/address/schemas/address.schema";
import type { Address } from "@/features/address/types/address.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

interface AddressApiResponse {
  address_line: string;
  city: string;
  created_at: string;
  id: string;
  is_default: boolean;
  phone: string | null;
  postal_code: string;
  recipient_name: string;
}

interface AddressMutationResponse {
  message?: string;
}

const mapAddress = (address: AddressApiResponse): Address => {
  return {
    addressLine: address.address_line,
    city: address.city,
    createdAt: address.created_at,
    id: address.id,
    isDefault: address.is_default,
    phone: address.phone,
    postalCode: address.postal_code,
    recipientName: address.recipient_name,
  };
};

const create = async (
  accessToken: string,
  input: CreateAddressInput,
): Promise<ApiResult<AddressMutationResponse>> => {
  return api.post<AddressMutationResponse>(
    "/api/addresses",
    {
      address_line: input.addressLine.trim(),
      city: input.city.trim(),
      is_default: input.isDefault,
      phone: input.phone.trim(),
      postal_code: input.postalCode.trim(),
      recipient_name: input.recipientName.trim(),
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

const getAll = async (accessToken: string): Promise<ApiResult<Address[]>> => {
  const result = await api.get<AddressApiResponse[]>("/api/addresses", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...result,
    data: result.data.map(mapAddress),
  };
};

export const addressService = {
  create,
  getAll,
};
