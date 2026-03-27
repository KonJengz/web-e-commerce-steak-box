export interface Address {
  addressLine: string;
  city: string;
  createdAt: string;
  id: string;
  isDefault: boolean;
  phone: string | null;
  postalCode: string;
  recipientName: string;
}

export interface AddressFieldErrors {
  addressLine?: string[];
  city?: string[];
  isDefault?: string[];
  phone?: string[];
  postalCode?: string[];
  recipientName?: string[];
}

export interface CreateAddressActionState {
  fieldErrors?: AddressFieldErrors;
  message?: string;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface UpdateAddressActionState {
  fieldErrors?: AddressFieldErrors;
  message?: string;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface DeleteAddressActionState {
  message?: string;
  requiresReauthentication?: boolean;
  success: boolean;
}
