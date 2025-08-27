export function getBackendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
}

export function getTransactionBaseUrl(): string {
  return process.env.NEXT_PUBLIC_TRANSACTION_URL ?? "http://localhost:3099";
}

export function getPaymentBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PAYMENT_URL ?? "http://localhost:3100";
}

export function getWebsocketUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL ?? getBackendBaseUrl();
}
