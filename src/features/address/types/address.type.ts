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

export interface CreateAddressFieldErrors {
  addressLine?: string[];
  city?: string[];
  isDefault?: string[];
  phone?: string[];
  postalCode?: string[];
  recipientName?: string[];
}

export interface CreateAddressActionState {
  fieldErrors?: CreateAddressFieldErrors;
  message?: string;
  requiresReauthentication?: boolean;
  success: boolean;
}
