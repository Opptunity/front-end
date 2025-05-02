"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEmailCollection } from "@/contexts/email-collection-context";

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
  const { isEmailCollected, setShowEmailDialog } = useEmailCollection();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    
    // Check for email in localStorage
    const existingEmail = localStorage.getItem("userEmail") || localStorage.getItem("assessmentEmail");
    
    if (!isEmailCollected && !existingEmail) {
      e.preventDefault();
      setShowEmailDialog(true);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
} 