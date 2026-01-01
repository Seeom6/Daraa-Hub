export interface Profile {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

