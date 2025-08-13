import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, message' 
      }, { status: 400 });
    }

    const html = `
      <h2>Test Email</h2>
      <p>${message}</p>
      <p>This is a test email from the Opptunity system.</p>
    `;

    // Send email via internal API call
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text: message
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 