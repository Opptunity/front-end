import { OnboardingFlow } from '@/components/onboarding-flow';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to the Team!
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              Let's get you set up and ready to start contributing. This onboarding process will help us understand your skills and goals.
            </p>
          </div>
          
          <OnboardingFlow />
        </div>
      </div>
    </div>
  );
} 