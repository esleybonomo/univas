export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
}

export interface CreateOrderDTO {
  userId: string;
  productId: string;
  quantity: number;
}
