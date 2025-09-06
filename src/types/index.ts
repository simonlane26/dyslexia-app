// src/types/index.ts
export type CreateUserParams = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string; // ✅ Add this
  imageUrl: string; // ✅ Add this
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string; // ✅ Add this
};