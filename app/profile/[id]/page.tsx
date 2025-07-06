"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmployeeSkillsProfile } from '@/components/employee-skills-profile'
import ProtectedRoute from '@/components/protected-route'

export default function EmployeeProfilePage() {
  const params = useParams()
  const employeeId = params.id as string

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
                  <p className="text-gray-600">Skills assessment and career development overview</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          <EmployeeSkillsProfile 
            employeeId={employeeId}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
} 