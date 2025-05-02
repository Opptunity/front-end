"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

type EmailContextType = {
  email: string;
  setEmail: (email: string) => void;
  isEmailProvided: boolean;
};

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string>('');
  
  // Check if email exists in localStorage on initial load
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Save email to localStorage whenever it changes
  useEffect(() => {
    if (email) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('assessmentEmail', email);
    }
  }, [email]);

  const isEmailProvided = !!email;

  return (
    <EmailContext.Provider value={{ email, setEmail, isEmailProvided }}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  
  return context;
} 