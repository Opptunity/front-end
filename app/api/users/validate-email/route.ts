import { NextResponse } from 'next/server';

// List of allowed domain endings for SSO
const ALLOWED_SSO_DOMAINS = [
  'company.com',
  'workos.com',
  'esprit.tn',
  // Add more allowed domains as needed
];

export async function POST(request: Request) {
  try {
    // Parse the JSON request body
    const body = await request.json();
    const { email } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if it's a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Extract the domain from the email
    const domain = email.split('@')[1].toLowerCase();

    // Check if the domain is in the allowed list for SSO
    const isDomainAllowed = ALLOWED_SSO_DOMAINS.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    );

    if (!isDomainAllowed) {
      return NextResponse.json(
        { error: 'This email domain is not supported for SSO. Please use your company email.' },
        { status: 403 }
      );
    }

    // Optional: Check if this email exists in your user database
    // const user = await findUserByEmail(email);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'No account found with this email. Please sign up first.' },
    //     { status: 404 }
    //   );
    // }

    // If all checks pass, return success
    return NextResponse.json(
      { success: true, message: 'Email validation successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email validation' },
      { status: 500 }
    );
  }
} 