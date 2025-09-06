// app/api/test-clerk/route.ts
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
try {
const clerk = clerkClient;
const users = await clerk.users.getUserList({ limit: 1 });

if (users.data.length > 0) {
const testUser = users.data[0];
const updatedUser = await clerk.clerkClient.users.updateUser(testUser.id, {
publicMetadata: { test: Date.now().toString() }
});

return NextResponse.json({
success: true,
message: 'Clerk key has proper permissions',
user: updatedUser
});
}

return NextResponse.json({
success: false,
message: 'No users found'
});

} catch (error) {
console.error('Clerk test error:', error);
return NextResponse.json({
success: false,
message: 'Clerk key permission test failed',
error: error instanceof Error ? error.message : 'Unknown error occurred'
}, { status: 500 });
}
}
