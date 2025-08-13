'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestEmail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test Email from Opptunity');
  const [message, setMessage] = useState('This is a test email to verify the email system is working.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const sendTestEmail = async () => {
    if (!to || !subject || !message) {
      setResult({ error: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ error: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setResult({ error: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Email System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">To:</label>
          <Input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subject:</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Message:</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Email message"
            rows={4}
          />
        </div>

        <Button 
          onClick={sendTestEmail} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </Button>

        {result && (
          <div className={`p-3 rounded ${
            result.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {result.success ? result.message : result.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 