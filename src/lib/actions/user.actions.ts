// src/lib/actions/user.actions.ts
import { clerkClient } from '@clerk/nextjs/server';
import { CreateUserParams, UpdateUserParams } from '@/types';

export async function createUser(userData: CreateUserParams) {
  try {
const { firstName, lastName, username, email, imageUrl } = userData;

const client = await clerkClient();
const user = await client.users.createUser({
      firstName,
      lastName,
      username,
      emailAddress: [email],
    });
    return user;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

export async function updateUser(userId: string, userData: UpdateUserParams) {
  try {
    const { firstName, lastName, username, imageUrl } = userData;

const client = await clerkClient();
const user = await client.users.updateUser(userId, {
  firstName,
  lastName,
  username,
});

    return user;
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function deleteUser(userId: string) {
  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}