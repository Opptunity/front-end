import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function DeliveryManagerLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 