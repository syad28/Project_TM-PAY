// Tripay Product Interface
export interface TripayProduct {
  code: string;
  name: string;
  category: string;
  brand: string;
  type: string;
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
}

// Tripay Transaction Request
export interface TripayTransactionRequest {
  method: string;
  merchant_ref: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: TripayOrderItem[];
  callback_url: string;
  return_url?: string;
  expired_time?: number;
  signature: string;
}

export interface TripayOrderItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

// Tripay Transaction Response
export interface TripayTransactionResponse {
  success: boolean;
  message: string;
  data: TripayTransactionData;
}

export interface TripayTransactionData {
  reference: string;
  merchant_ref: string;
  payment_selection_type: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  callback_url: string;
  return_url: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  pay_code: string;
  pay_url: string;
  checkout_url: string;
  status: string;
  expired_time: number;
  order_items: TripayOrderItem[];
  instructions: TripayInstruction[];
  qr_code?: string;
  qr_url?: string;
}

export interface TripayInstruction {
  title: string;
  steps: string[];
}

// Tripay Callback Data
export interface TripayCallbackData {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_method_code: string;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: number;
  status: string;
  paid_at: number;
  note: string;
}

// Tripay Product List Response
export interface TripayProductListResponse {
  success: boolean;
  message: string;
  data: TripayProduct[];
}
