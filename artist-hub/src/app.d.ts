/// <reference types="@sveltejs/kit" />

declare global {
  interface Window {
    webln?: {
      enable: () => Promise<void>;
      sendPayment: (invoice: string) => Promise<any>;
      makeInvoice?: (args: { amount: number; defaultMemo?: string }) => Promise<{ paymentRequest: string }>;
    };
  }
}

export {};

