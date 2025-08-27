export interface PayRequestDto {
  transactionId: string;
  quantity: number;
}

export interface PayResponseDto {
  success: boolean;
}
