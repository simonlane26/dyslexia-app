// src/types/index.ts
export type CreateUserParams = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  imageUrl: string;
  // Add a typo to test
  __TEST__: string; // ❌ This should cause an error
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string; // ✅ Add this
};