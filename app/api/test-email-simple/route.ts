import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Email test endpoint is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    if (!body.to || !body.subject) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject' 
      }, { status: 400 });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ 
        error: 'SMTP not configured. Please set SMTP_USER and SMTP_PASS environment variables.',
        smtpConfigured: false
      }, { status: 500 });
    }

    // Return success without actually sending email for now
    return NextResponse.json({ 
      success: true, 
      message: 'Email test endpoint reached successfully',
      smtpConfigured: true,
      data: {
        to: body.to,
        subject: body.subject,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 