"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmailPopup } from "@/components/ui/email-popup";
import { useEmail } from "@/contexts/EmailContext";

interface AssessmentLinkProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function AssessmentLink({ 
  children, 
  className = "", 
  href = "/assessment",
  onClick
}: AssessmentLinkProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { email, setEmail, isEmailProvided } = useEmail();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    
    if (!isEmailProvided) {
      e.preventDefault();
      setIsPopupOpen(true);
    }
  };

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setIsPopupOpen(false);
    router.push(href);
  };

  return (
    <>
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
      
      <EmailPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleEmailSubmit}
      />
    </>
  );
} 