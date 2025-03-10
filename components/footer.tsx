"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Contact", href: "#" },
      ],
    },
    {
      title: "Product",
      links: [
        { name: "Features", href: "#value-props" },
        { name: "Pricing", href: "#pricing" },
        { name: "Documentation", href: "#" },
        { name: "API Access", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Community", href: "#" },
        { name: "Webinars", href: "#" },
        { name: "Partners", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Compliance", href: "#" },
        { name: "Security", href: "#" },
      ],
    },
  ]

  const socialLinks = [
    { icon: <Linkedin size={20} />, name: "LinkedIn", href: "#" },
    { icon: <Twitter size={20} />, name: "Twitter", href: "#" },
    { icon: <Facebook size={20} />, name: "Facebook", href: "#" },
    { icon: <Instagram size={20} />, name: "Instagram", href: "#" },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div whileHover={{ scale: 1.05, x: 5 }} transition={{ duration: 0.2 }} className="mb-4">
              <Link href="/" className="text-2xl font-bold text-white">
                Opptunity
              </Link>
            </motion.div>
            <p className="mb-6 text-gray-400 max-w-md">
              AI-powered platform for upskilling, reskilling, and optimizing company taxonomy. Empower your team with
              next-generation learning tools.
            </p>

            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Subscribe to our newsletter</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-gray-800 border-gray-700 text-white rounded-r-none focus-visible:ring-blue-500"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-l-none">Subscribe</Button>
              </div>
            </div>

            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.div key={index} whileHover={{ y: -5, scale: 1.2 }} transition={{ duration: 0.2 }}>
                  <Link href={social.href} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {social.icon}
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <motion.li key={link.name} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors">
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Opptunity. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <Mail size={16} className="mr-2 text-gray-400" />
            <a href="mailto:info@opptunity.ai" className="text-gray-400 hover:text-blue-400 transition-colors">
              info@opptunity.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

