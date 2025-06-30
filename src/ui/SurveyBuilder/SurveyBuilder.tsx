import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SurveyStep } from './SurveyStep'
import { QuestionsStep } from './QuestionsStep'
import { DistributionStep } from './DistributionStep'
import type { Survey } from '@/services/api'

type Step = 'survey' | 'questions' | 'distribution'

export function SurveyBuilder() {
  const [currentStep, setCurrentStep] = useState<Step>('survey')
  const [survey, setSurvey] = useState<Survey | null>(null)
  const queryClient = useQueryClient()

  const handleSurveyCreated = (survey: Survey) => {
    console.log('survey', survey)
    setSurvey(survey)
    setCurrentStep(survey.type === 'internal' ? 'questions' : 'distribution')
    queryClient.invalidateQueries({ queryKey: ['surveys'] })
  }

  const handleQuestionsCreated = () => {
    setCurrentStep('distribution')
  }

  const handleDistributionCreated = () => {
    setCurrentStep('survey')
    setSurvey(null)
    queryClient.invalidateQueries({ queryKey: ['surveys'] })
  }

  const handlePrev = () => {
    if (currentStep === 'distribution') {
      setCurrentStep('questions')
    } else if (currentStep === 'questions') {
      setCurrentStep('survey')
      setSurvey(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`flex items-center ${currentStep === 'survey' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'survey'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300'
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Survey Details</span>
          </div>

          <div
            className={`flex items-center ${currentStep === 'questions' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'questions'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300'
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Questions</span>
          </div>

          <div
            className={`flex items-center ${currentStep === 'distribution' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'distribution'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300'
              }`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Distribution</span>
          </div>
        </div>
      </div>

      {currentStep === 'survey' && (
        <SurveyStep onSurveyCreated={handleSurveyCreated} />
      )}

      {currentStep === 'questions' && survey && (
        <QuestionsStep
          surveyId={survey.id}
          onQuestionsAdded={handleQuestionsCreated}
          onPrev={handlePrev}
        />
      )}

      {currentStep === 'distribution' && survey && (
        <DistributionStep
          surveyId={survey.id}
          onDistributionCreated={handleDistributionCreated}
          onPrev={handlePrev}
        />
      )}
    </div>
  )
}
