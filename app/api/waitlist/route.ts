import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Mailchimp API credentials
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const SERVER = process.env.MAILCHIMP_SERVER;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;

    // Construct the API URL
    const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
    
    // Create the request body
    const data = {
      email_address: email,
      status: 'subscribed', // or 'pending' if you want double opt-in
    };

    // Send the request to Mailchimp
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // Handle duplicate emails (Mailchimp returns a 400 status)
    if (response.status === 400 && result.title === 'Member Exists') {
      return NextResponse.json(
        { success: true, message: 'Email already subscribed' },
        { status: 200 }
      );
    }

    if (!response.ok) {
      throw new Error(result.detail || 'Error subscribing to newsletter');
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to the waitlist!' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while subscribing' },
      { status: 500 }
    );
  }
}
