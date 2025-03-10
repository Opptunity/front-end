"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import type { ReactNode } from "react"

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode
}

export default function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
      <Button {...props}>{children}</Button>
    </motion.div>
  )
}

