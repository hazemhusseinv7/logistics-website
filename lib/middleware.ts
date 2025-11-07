import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function getAuthToken(request: NextRequest): string | null {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  return token || null;
}

export function authenticateRequest(request: NextRequest): { userId: number; email: string; role: string } | null {
  const token = getAuthToken(request);
  if (!token) return null;
  
  return verifyToken(token);
}

export function requireAuth(request: NextRequest, allowedRoles?: string[]): { userId: number; email: string; role: string } | null {
  const user = authenticateRequest(request);
  
  if (!user) {
    return null;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  
  return user;
}



