import { NextRequest, NextResponse } from 'next/server';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmailInternal(options: EmailRequest): Promise<void> {
  // Dynamic import to avoid bundling issues
  const nodemailer = await import('nodemailer');
  
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fromAddress = process.env.EMAIL_FROM || smtpUser;

  await transporter.sendMail({
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, html' 
      }, { status: 400 });
    }

    await sendEmailInternal({ to, subject, html, text });

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 