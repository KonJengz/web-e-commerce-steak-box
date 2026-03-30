export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  qrCodeUrl?: string;
}

export const STORE_BANK_ACCOUNTS: BankAccount[] = [
  {
    accountName: "Steak Box Co., Ltd.",
    accountNumber: "123-4-56789-0",
    bankName: "Kasikorn Bank (KBank)",
    // Optional placeholder for PromptPay QR image URL
    // qrCodeUrl: "https://example.com/qr-code.png",
  },
];
