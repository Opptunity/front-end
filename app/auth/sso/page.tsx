"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";

export default function SSOSignIn() {
  const { t } = useLanguage() || { t: (key: string) => key };
  
  useEffect(() => {
    // Rediriger automatiquement vers la route API
    window.location.href = '/api/auth/sso';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <Link href="/">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Opptunity</h2>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {t("signInWithSSO") || "Sign In with SSO"}
          </h2>
          <p className="text-gray-600">
            {t("initiatingSSO") || "Initiating SSO authentication..."}
          </p>
          <div className="mt-6">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 