import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Simple credential-based auth
// ---------------------------------------------------------------------------

const SALT = process.env.NEXTAUTH_SECRET || 'vx-default-salt';

function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + SALT)
    .digest('hex');
}

// Authorised users — add more entries here as needed.
// Passwords are checked at runtime via hashPassword().
interface AuthUser {
  email: string;
  name: string;
  password: string; // plain-text checked at runtime, never stored
}

const USERS: AuthUser[] = [
  { email: 'brad@eyre.co.za', name: 'Brad', password: 'Epic2025!' },
  { email: 'wesley@epicdeals.co.za', name: 'Wesley', password: 'Epic2025!' },
];

/**
 * Generate a simple session token (SHA256 hash of email + timestamp + secret).
 * This isn't a full JWT, but it's sufficient for a small team app.
 */
function generateToken(email: string): string {
  return crypto
    .createHash('sha256')
    .update(email + Date.now().toString() + SALT)
    .digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Look up user (case-insensitive email)
    const user = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const token = generateToken(user.email);

    // Return token + user info. The client stores these in localStorage.
    const response = NextResponse.json({
      success: true,
      token,
      user: { email: user.email, name: user.name },
    });

    // Also set an httpOnly cookie so server-side can check auth later
    response.cookies.set('vx-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 },
    );
  }
}
