export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse {
  message: string;
  status: number;
}
