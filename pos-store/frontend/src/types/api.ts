// Base Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
  }
  
  export interface PaginatedResponse<T> {
    [x: string]: any;
    items: T[];
    total: number;
    page: number;
    pages: number;
  }
  
  // Auth Types
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  export interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    active: boolean;
    last_login?: string;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
    role?: string;
  }
  
  export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
  }
  
  export interface ResetPasswordRequest {
    email: string;
  }
  
  export interface VerifyEmailRequest {
    token: string;
  }  
  
  // Category Types
  export interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parent_id?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateCategoryRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parent_id?: string;
  }
  
  export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    parent_id?: string;
  }
  
  export interface CategoryTreeItem extends Category {
    children: CategoryTreeItem[];
  }
  
  // Product Types
  export interface Product {
    _id: string;
    name: string;
    barcode?: string;
    description?: string;
    category_id: string;
    price: number;
    cost_price: number;
    unit: string;
    image_url?: string;
    stock_quantity: number;
    quantity: number;
    min_stock_level: number;
    max_stock_level: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProductResponse {
    products: Product[];
    total: number;
    page: number;
    pages: number;
  }
  
  export interface CreateProductRequest {
    name: string;
    barcode?: string;
    description?: string;
    category_id?: string;
    price: number;
    cost_price: number;
    unit: string;
    image_url?: string;
    stock_quantity: number;
    min_stock_level: number;
    max_stock_level: number;
    is_active?: boolean;
  }
  
  export interface UpdateProductRequest {
    name?: string;
    barcode?: string;
    description?: string;
    category_id?: string;
    price?: number;
    cost_price?: number;
    unit?: string;
    image_url?: string;
    stock_quantity?: number;
    min_stock_level?: number;
    max_stock_level?: number;
    is_active?: boolean;
  }
  
  export interface BatchUpdateProductRequest {
    products: {
      product_id: string;
      quantity?: number;
      price?: number;
      cost_price?: number;
      is_active?: boolean;
    }[];
  }
  
  // Order Types
  export interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    discount: number;
    subtotal: number;
  }
  
  export interface Order {
    _id: string;
    order_number: string;
    customer_id?: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    payment_method: 'cash' | 'card' | 'transfer' | 'momo';
    payment_status: 'pending' | 'paid' | 'refunded';
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateOrderRequest {
    customer_id?: string;
    items: {
      product_id: string;
      name: string;
      price: number;
      quantity: number;
      discount?: number;
    }[];
    payment_method: 'cash' | 'card' | 'transfer' | 'momo';
    notes?: string;
    created_by?: string;
  }
  
  export interface UpdateOrderStatusRequest {
    status: 'pending' | 'completed' | 'cancelled';
  }  
  
  // Payment Types
  export interface Payment {
    _id: string;
    order_number: string;
    amount: number;
    method: string;
    reference?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    created_at: string;
    updated_at: string;
    verified_at?: string;
  }

  export interface PaymentMethod {
    id: 'cash' | 'card' | 'transfer' | 'momo';
    name: string;
    icon: string;
    active: boolean;
    description: string;
    min_amount: number;
    max_amount?: number;
    type: 'online' | 'offline';
  }

  export interface PaymentVerification {
    order_number: string;
    payment_status: string;
    verified_at: string;
  }

  export interface RefundPayment {
    _id: string;
    order_number: string;
    payment_id: string;
    amount: number;
    reason?: string;
    method: string;
    reference?: string;
    status: 'pending' | 'completed';
    created_at: string;
    updated_at: string;
    completed_at?: string;
  }

  