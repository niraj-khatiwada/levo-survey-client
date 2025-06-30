import { createFileRoute } from '@tanstack/react-router'
import { SurveyBuilder } from '../ui/SurveyBuilder/SurveyBuilder'
import { Navbar } from '../components/Navbar/Navbar'

export const Route = createFileRoute('/survey-builder')({
  component: SurveyBuilderPage,
})

function SurveyBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Survey</h1>
        </div>
        <SurveyBuilder />
      </div>
    </div>
  )
}
