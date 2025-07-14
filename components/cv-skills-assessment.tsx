"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, User, Brain, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { assessSkills } from '@/lib/skills-assessment'
import { EmployeeSkillsProfile } from './employee-skills-profile'

interface CVSkillsAssessmentProps {
  onEmployeeCreated?: (employeeData: any) => void
  mode?: 'create' | 'assess' // create = create new employee, assess = just assess CV
}

export function CVSkillsAssessment({ 
  onEmployeeCreated, 
  mode = 'assess' 
}: CVSkillsAssessmentProps) {
  const [cvText, setCvText] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'assessing' | 'results'>('input')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setCvText(text)
      }
      reader.readAsText(file)
    }
  }

  const handleAssessment = async () => {
    if (!cvText.trim()) {
      setError('Please provide CV text or upload a CV file')
      return
    }

    if (mode === 'create' && (!employeeName.trim() || !employeeEmail.trim())) {
      setError('Please provide employee name and email for profile creation')
      return
    }

    try {
      setIsAssessing(true)
      setError('')
      setStep('assessing')

      console.log('Starting CV assessment...')
      
      // Assess the CV using the existing skills assessment system
      const assessment = await assessSkills(cvText, employeeEmail || undefined)
      
      console.log('Assessment completed:', assessment)

      if (mode === 'create') {
        // Create employee profile with assessment
        const employeeData = {
          id: employeeEmail,
          name: employeeName,
          email: employeeEmail,
          position: position || 'Employee',
          department: department || null,
          startDate: new Date().toISOString(),
          assessment: assessment
        }

        // Save to database if needed
        try {
          const response = await fetch('/api/employees/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
          })

          if (response.ok) {
            const savedEmployee = await response.json()
            console.log('Employee created successfully:', savedEmployee)
            onEmployeeCreated?.(savedEmployee)
          }
        } catch (saveError) {
          console.warn('Failed to save employee to database:', saveError)
          // Continue with local display even if save fails
        }

        setAssessmentResult({
          employeeData,
          assessment
        })
      } else {
        // Just display assessment results
        setAssessmentResult({
          assessment,
          employeeData: {
            id: 'cv-assessment',
            name: 'CV Assessment',
            email: 'assessment@example.com',
            assessment: assessment
          }
        })
      }

      setStep('results')
    } catch (err) {
      console.error('Error during assessment:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during assessment')
      setStep('input')
    } finally {
      setIsAssessing(false)
    }
  }

  const resetAssessment = () => {
    setStep('input')
    setAssessmentResult(null)
    setCvText('')
    setEmployeeName('')
    setEmployeeEmail('')
    setPosition('')
    setDepartment('')
    setError('')
  }

  if (step === 'results' && assessmentResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Employee Profile Created' : 'CV Assessment Results'}
          </h2>
          <Button variant="outline" onClick={resetAssessment}>
            {mode === 'create' ? 'Create Another Employee' : 'Assess Another CV'}
          </Button>
        </div>
        
        <EmployeeSkillsProfile 
          employeeId={assessmentResult.employeeData.id}
          employeeData={assessmentResult.employeeData}
        />
      </div>
    )
  }

  if (step === 'assessing') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <Brain className="h-8 w-8 absolute top-4 left-1/2 transform -translate-x-1/2 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Analyzing CV</h3>
            <p className="text-gray-600">
              Our AI is analyzing the CV to extract skills, experience, and career insights...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>This may take a few moments</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            {mode === 'create' ? 'Create Employee Profile from CV' : 'CV Skills Assessment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === 'create' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="employeeEmail">Email Address *</Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>CV Content</Label>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Upload CV file (.txt, .pdf, .doc, .docx)
                </span>
                <span className="text-xs text-gray-400">or paste text below</span>
              </label>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="cvText">Or paste CV text directly:</Label>
              <Textarea
                id="cvText"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste the CV content here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleAssessment}
            disabled={isAssessing || !cvText.trim()}
            className="w-full"
            size="lg"
          >
            {isAssessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing CV...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Employee Profile' : 'Analyze CV Skills'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
} 