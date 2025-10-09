// PPOB Transaction Response
export interface PPOBTransactionResponse {
  id: number;
  referenceId: string;
  productCode: string;
  productName: string;
  productType: string;
  target: string;
  price: number;
  adminFee: number;
  totalPrice: number;
  status: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  sn?: string;
  message?: string;
  tripayReference?: string;
  tripayStatus?: string;
}

// PPOB Product Response
export interface PPOBProductResponse {
  code: string;
  name: string;
  type: string;
  price: number;
  adminFee: number;
  totalPrice: number;
  description?: string;
  status: string;
  stock?: number;
}

// PPOB List Response
export interface PPOBListResponse {
  data: PPOBTransactionResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// PPOB Stats Response
export interface PPOBStatsResponse {
  totalTransactions: number;
  totalVolume: number;
  byType: {
    pulsa: number;
    paket_data: number;
    pln: number;
    bpjs: number;
    pdam: number;
  };
  successRate: number;
  todayTransactions: number;
}
