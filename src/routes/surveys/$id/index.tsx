import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { SurveyDetails } from '../../../ui/SurveyDetails/Details'
import { Questions } from '../../../ui/SurveyDetails/Questions'
import { Distributions } from '../../../ui/SurveyDetails/Distributions'
import { Responses } from '../../../ui/SurveyDetails/Responses'
import { Analytics } from '../../../ui/SurveyDetails/Analytics'
import { Navbar } from '../../../components/Navbar/Navbar'

export const Route = createFileRoute('/surveys/$id/')({
  component: SurveyDetailsPage,
})

const TABS = [
  'Details',
  'Questions',
  'Distributions',
  'Responses',
  'Analytics',
] as const
type Tab = (typeof TABS)[number]

export function SurveyDetailsPage() {
  const { id } = useParams({ from: '/surveys/$id/' })
  const [tab, setTab] = useState<Tab>('Details')

  if (!id) {
    return <div className="p-6">Survey ID not found</div>
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Survey Details
            </h1>
          </div>
          <p className="text-gray-600">
            View and manage survey information, questions, and distributions
          </p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tabName) => (
              <button
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  tab === tabName
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tabName}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'Details' && <SurveyDetails />}

        {tab === 'Questions' && <Questions />}

        {tab === 'Distributions' && <Distributions />}

        {tab === 'Responses' && <Responses surveyId={id} />}

        {tab === 'Analytics' && <Analytics surveyId={id} />}
      </div>
    </>
  )
}
