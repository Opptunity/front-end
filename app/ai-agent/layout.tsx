import ProtectedRoute from "@/components/protected-route"

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
} 