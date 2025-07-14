"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import AnimatedButton from "./animations/animated-button"
import LanguageSwitcher from "./language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { useEmailCollection } from "@/contexts/email-collection-context"
import { useRouter } from "next/navigation"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, isRTL } = useLanguage()
  const { setShowEmailDialog } = useEmailCollection()
  const router = useRouter()
  const auth = useAuth()
  const { isBackendAuthenticated } = useBackendAuth()

  // Check if user is authenticated via WorkOS or backend
  const isLoggedIn = !!auth.user || isBackendAuthenticated

  const navItems = [
    { name: t("features"), href: "#value-props" },
    { name: t("howItWorks"), href: "#how-it-works" },
    { name: t("pricing"), href: "#pricing" },
    { name: t("faq"), href: "#faq" },
  ]

  const closeAllMenus = () => {
    setIsMenuOpen(false);
  }

  const handleShowEmailPopup = () => {
    // Check if email already exists in localStorage
    const existingEmail = localStorage.getItem("userEmail") || localStorage.getItem("assessmentEmail")
    
    if (existingEmail) {
      // If email exists, go directly to assessment
      router.push("/assessment")
    } else {
      // Show the email collection dialog instead of the EmailPopup
      setShowEmailDialog(true)
      closeAllMenus();
    }
  };

  return (
    <motion.header
      className="border-b border-gray-100 bg-white sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Opptunity</span>
            </Link>
          </motion.div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className={`order-${isRTL ? "last" : "first"}`}>
              <LanguageSwitcher />
            </div>
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={isRTL ? "mr-8" : ""}
              >
                <Link href={item.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex space-x-4"
            >
              {/* Conditionally render Login or Dashboard based on authentication */}
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <AnimatedButton className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                    {t("dashboard") || "Dashboard"}
                  </AnimatedButton>
                </Link>
              ) : (
                <Link href="/auth/sso">
                  <AnimatedButton className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                    {t("login") || "Login"}
                  </AnimatedButton>
                </Link>
              )}
              
              <Link href="/#waitlist-form">
                <AnimatedButton className="bg-blue-600 text-white hover:bg-blue-700">{t("joinWaitlist")}</AnimatedButton>
              </Link>
            </motion.div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <div className={`order-${isRTL ? "last" : "first"}`}>
              <LanguageSwitcher />
            </div>
            <motion.button
              type="button"
              className="text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden py-4 space-y-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navItems.map((item, index) => (
                <div key={item.name}>
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                      onClick={closeAllMenus}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                </div>
              ))}
              <motion.div
                className="px-4 pt-2 pb-4 space-y-3"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {/* Conditionally render Login or Dashboard based on authentication */}
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={closeAllMenus}>
                    <AnimatedButton className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                      {t("dashboard") || "Dashboard"}
                    </AnimatedButton>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={closeAllMenus}>
                      <AnimatedButton className="w-full bg-white text-blue-600 border border-blue-600 hover:bg-blue-50">
                        {t("login") || "Login"}
                      </AnimatedButton>
                    </Link>
                    
                    <Link href="/auth/sso" onClick={closeAllMenus}>
                      <AnimatedButton className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                        {t("signInWithSSO") || "Sign in with SSO"}
                      </AnimatedButton>
                    </Link>
                  </>
                )}
                
                <Link href="/#waitlist-form" onClick={closeAllMenus}>
                  <AnimatedButton className="w-full bg-blue-600 text-white hover:bg-blue-700">
                    {t("joinWaitlist")}
                  </AnimatedButton>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

