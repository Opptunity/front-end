"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

interface TicketFormData {
  // Client Information
  clientName: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
  
  // Position Details
  positionTitle: string
  department: string
  seniority: string
  contractType: string
  duration: string
  startDate: string
  
  // Requirements
  requiredSkills: string[]
  preferredSkills: string[]
  experience: string
  education: string
  certifications: string
  
  // Project Details
  projectDescription: string
  responsibilities: string
  workLocation: string
  workArrangement: string
  
  // Budget & Terms
  budgetMin: string
  budgetMax: string
  currency: string
  rateType: string
  
  // Additional Information
  urgency: string
  specialRequirements: string
  notes: string
}

export default function CreateTicketPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const auth = useAuth()
  const { backendUser } = useBackendAuth()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState<TicketFormData>({
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    positionTitle: "",
    department: "",
    seniority: "",
    contractType: "",
    duration: "",
    startDate: "",
    requiredSkills: [],
    preferredSkills: [],
    experience: "",
    education: "",
    certifications: "",
    projectDescription: "",
    responsibilities: "",
    workLocation: "",
    workArrangement: "",
    budgetMin: "",
    budgetMax: "",
    currency: "USD",
    rateType: "",
    urgency: "",
    specialRequirements: "",
    notes: ""
  })

  const [skillInput, setSkillInput] = useState("")
  const [preferredSkillInput, setPreferredSkillInput] = useState("")

  const addSkill = (type: 'required' | 'preferred') => {
    const input = type === 'required' ? skillInput : preferredSkillInput
    if (input.trim()) {
      setFormData(prev => ({
        ...prev,
        [type === 'required' ? 'requiredSkills' : 'preferredSkills']: [
          ...prev[type === 'required' ? 'requiredSkills' : 'preferredSkills'],
          input.trim()
        ]
      }))
      if (type === 'required') {
        setSkillInput("")
      } else {
        setPreferredSkillInput("")
      }
    }
  }

  const removeSkill = (index: number, type: 'required' | 'preferred') => {
    setFormData(prev => ({
      ...prev,
      [type === 'required' ? 'requiredSkills' : 'preferredSkills']: 
        prev[type === 'required' ? 'requiredSkills' : 'preferredSkills'].filter((_, i) => i !== index)
    }))
  }

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Prepare ticket data
      const ticketData = {
        createdBy: auth.user?.email || backendUser?.email || 'unknown',
        status: 'pending',
        priority: formData.urgency,
        ...formData
      }

      // Send to the tickets API
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create ticket')
      }

      const result = await response.json()
      console.log('Ticket created successfully:', result)
      
      // Redirect to success page or dashboard
      router.push(`/dashboard?ticketCreated=${result.ticketNumber}`)
    } catch (error) {
      console.error('Error creating ticket:', error)
      // You could show an error message to the user here
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.clientName && formData.clientCompany && formData.clientEmail
      case 2:
        return formData.positionTitle && formData.contractType && formData.startDate
      case 3:
        return formData.requiredSkills.length > 0 && formData.experience
      case 4:
        return formData.budgetMin && formData.urgency
      default:
        return false
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M19 12H5m7-7-7 7 7 7"/>
              </svg>
              <span className="text-gray-700 font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Create New Ticket
            </h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </header>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentStep === 1 && "Client Information"}
              {currentStep === 2 && "Position Details"}
              {currentStep === 3 && "Requirements & Skills"}
              {currentStep === 4 && "Budget & Timeline"}
            </h2>
            <p className="text-gray-600 mt-2">
              {currentStep === 1 && "Enter the client's contact information and company details"}
              {currentStep === 2 && "Define the position requirements and contract details"}
              {currentStep === 3 && "Specify required skills, experience, and qualifications"}
              {currentStep === 4 && "Set budget range, urgency, and additional notes"}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              {/* Step 1: Client Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Acme Corporation"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="john.doe@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Position Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position Title *
                      </label>
                      <input
                        type="text"
                        value={formData.positionTitle}
                        onChange={(e) => handleInputChange('positionTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Engineering"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seniority Level
                      </label>
                      <select
                        value={formData.seniority}
                        onChange={(e) => handleInputChange('seniority', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Level</option>
                        <option value="junior">Junior (0-2 years)</option>
                        <option value="mid">Mid-level (2-5 years)</option>
                        <option value="senior">Senior (5-8 years)</option>
                        <option value="lead">Lead (8+ years)</option>
                        <option value="principal">Principal/Architect</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contract Type *
                      </label>
                      <select
                        value={formData.contractType}
                        onChange={(e) => handleInputChange('contractType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Type</option>
                        <option value="permanent">Permanent</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="6 months"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Arrangement
                      </label>
                      <select
                        value={formData.workArrangement}
                        onChange={(e) => handleInputChange('workArrangement', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Arrangement</option>
                        <option value="remote">Remote</option>
                        <option value="onsite">On-site</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Location
                    </label>
                    <input
                      type="text"
                      value={formData.workLocation}
                      onChange={(e) => handleInputChange('workLocation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Requirements & Skills */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills *
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('required')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter a skill and press Enter"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill('required')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index, 'required')}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Skills (Nice to have)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={preferredSkillInput}
                        onChange={(e) => setPreferredSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('preferred')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter a preferred skill"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill('preferred')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index, 'preferred')}
                            className="ml-2 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Required *
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-8">5-8 years</option>
                        <option value="8+">8+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education Level
                      </label>
                      <select
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Education</option>
                        <option value="high-school">High School</option>
                        <option value="associates">Associate's Degree</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="bootcamp">Bootcamp/Certification</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Certifications
                    </label>
                    <textarea
                      value={formData.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="AWS Certified, PMP, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Responsibilities
                    </label>
                    <textarea
                      value={formData.responsibilities}
                      onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe the main responsibilities and duties..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Budget & Timeline */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Min *
                      </label>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Max
                      </label>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="80000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Type
                      </label>
                      <select
                        value={formData.rateType}
                        onChange={(e) => handleInputChange('rateType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Rate</option>
                        <option value="annual">Annual Salary</option>
                        <option value="monthly">Monthly Rate</option>
                        <option value="daily">Daily Rate</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency *
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Urgency</option>
                      <option value="low">Low - Can wait 4+ weeks</option>
                      <option value="medium">Medium - 2-4 weeks</option>
                      <option value="high">High - 1-2 weeks</option>
                      <option value="urgent">Urgent - ASAP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description
                    </label>
                    <textarea
                      value={formData.projectDescription}
                      onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe the project and context..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requirements
                    </label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Security clearance, travel requirements, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  Step {currentStep} of 4
                </div>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isStepValid()
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <AnimatedButton
                    onClick={handleSubmit}
                    disabled={!isStepValid() || loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                      isStepValid() && !loading
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Ticket...
                      </>
                    ) : (
                      'Create Ticket'
                    )}
                  </AnimatedButton>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 