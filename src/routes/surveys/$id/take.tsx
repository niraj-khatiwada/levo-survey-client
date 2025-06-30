import { createFileRoute, useLocation, useParams } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  surveyApi,
  questionsApi,
  responsesApi,
  distributionApi,
} from '@/services/api'
import { isEmailValid } from '@/utils/email'
import { toast } from 'sonner'

export const Route = createFileRoute('/surveys/$id/take')({
  component: TakeSurvey,
})

interface Question {
  id: string
  text: string
  required: boolean
  order: number
  type: string
}

interface ChatMessage {
  id: string
  type: 'question' | 'answer' | 'info'
  content: string
  questionId?: string
  timestamp: Date
}

interface Answer {
  question_id: string
  value?: string
  values?: string[]
  rating?: number
  date_value?: string
}

interface RespondentData {
  name?: string
  email?: string
  distribution_id?: string
}

export function TakeSurvey() {
  const { id: surveyId } = useParams({ from: '/surveys/$id/take' })
  const { search } = useLocation()

  const distribution_id = (search as any)?.distribution_id as string | undefined
  const clicked_at = (search as any)?.clicked_at as number | undefined

  useEffect(() => {
    if (clicked_at && distribution_id) {
      distributionApi.incrementClickedCount(distribution_id)
    }
  }, [clicked_at, distribution_id])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [collectedAnswers, setCollectedAnswers] = useState<Answer[]>([])
  const [respondentData, setRespondentData] = useState<RespondentData>({
    name: '',
    email: '',
  })
  const [isCollectingRespondentInfo, setIsCollectingRespondentInfo] =
    useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: survey, isLoading: loadingSurvey } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => surveyApi.getSurveyById(surveyId!),
    enabled: !!surveyId,
  })

  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ['survey-questions', surveyId],
    queryFn: () => questionsApi.getQuestionsBySurveyId(surveyId!),
    enabled: !!surveyId,
  })

  const createResponseMutation = useMutation({
    mutationFn: (data: {
      survey_id: string
      respondent_data: RespondentData
    }) => responsesApi.createResponse(data),
    onSuccess: (data: any) => {
      setResponseId(data.id)
      setIsCollectingRespondentInfo(false)
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'info',
        content: `Welcome to "${survey?.title}"! Let's get started with the first question.`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    },
    onError: (error) => {
      console.error('Error creating response:', error)
      toast.error('Error starting survey. Please try again.')
    },
  })

  const submitAnswersMutation = useMutation({
    mutationFn: (data: { response_id: string; answers: Answer[] }) =>
      responsesApi.submitAnswers(data.response_id, data.answers),
    onSuccess: () => {
      setIsCompleted(true)
      const completionMessage: ChatMessage = {
        id: 'completion',
        type: 'info',
        content:
          'Thank you for completing the survey! Your responses have been recorded.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, completionMessage])
    },
    onError: (error) => {
      console.error('Error submitting answers:', error)
      toast.error('Error submitting answers. Please try again.')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (
      questions.length > 0 &&
      !responseId &&
      !isCompleted &&
      !createResponseMutation.isPending
    ) {
      if (distribution_id) {
        createResponseMutation.mutate({
          survey_id: surveyId!,
          respondent_data: { distribution_id },
        })
      } else if (!isCollectingRespondentInfo) {
        createResponseMutation.mutate({
          survey_id: surveyId!,
          respondent_data: {
            ...respondentData,
            email:
              respondentData?.email?.length === 0
                ? undefined
                : respondentData?.email,
          },
        })
      }
    }
  }, [
    questions,
    responseId,
    isCompleted,
    isCollectingRespondentInfo,
    respondentData,
    surveyId,
    distribution_id,
  ])

  useEffect(() => {
    if (responseId && questions.length > 0 && messages.length === 1) {
      showNextQuestion()
    }
  }, [responseId, questions, messages])

  const showNextQuestion = (index?: number) => {
    const _currentQuestionIndex = index ?? currentQuestionIndex
    if (_currentQuestionIndex < questions.length) {
      const question = questions[_currentQuestionIndex]
      const questionMessage: ChatMessage = {
        id: `question-${question.id}`,
        type: 'question',
        content: question.text,
        questionId: question.id,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, questionMessage])
    }
  }

  const handleSubmitAnswer = () => {
    if (!userInput.trim() || !responseId) return

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const answerMessage: ChatMessage = {
      id: `answer-${currentQuestion.id}`,
      type: 'answer',
      content: userInput,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, answerMessage])

    const answer: Answer = {
      question_id: currentQuestion.id,
      value: userInput,
    }

    const newAnswers = [...collectedAnswers, answer]
    setCollectedAnswers(newAnswers)

    const _newCurrentQuestionIndex = currentQuestionIndex + 1
    setCurrentQuestionIndex((prev) => prev + 1)
    setUserInput('')

    if (currentQuestionIndex + 1 >= questions.length) {
      submitAnswersMutation.mutate({
        response_id: responseId,
        answers: newAnswers,
      })
    } else {
      setTimeout(() => {
        showNextQuestion(_newCurrentQuestionIndex)
      }, 250)
    }
  }

  const handleSkipQuestion = () => {
    if (!responseId) return

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const skipMessage: ChatMessage = {
      id: `skip-${currentQuestion.id}`,
      type: 'answer',
      content: '[Skipped]',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, skipMessage])

    const answer: Answer = {
      question_id: currentQuestion.id,
      value: '',
    }

    const newAnswers = [...collectedAnswers, answer]
    setCollectedAnswers(newAnswers)

    const _newCurrentQuestionIndex = currentQuestionIndex + 1
    setCurrentQuestionIndex((prev) => prev + 1)
    setUserInput('')

    if (currentQuestionIndex + 1 >= questions.length) {
      submitAnswersMutation.mutate({
        response_id: responseId,
        answers: newAnswers,
      })
    } else {
      setTimeout(() => {
        showNextQuestion(_newCurrentQuestionIndex)
      }, 250)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isCollectingRespondentInfo) {
        handleSubmitAnswer()
      }
    }
  }

  console.log(messages)

  const isSubmitting =
    createResponseMutation.isPending || submitAnswersMutation.isPending

  if (loadingSurvey || loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Survey Not Found
          </h1>
          <p className="text-gray-600">
            The survey you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {survey.title}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
          {questions.length > 0 && !isCollectingRespondentInfo && (
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Progress:{' '}
                  {(currentQuestionIndex < questions.length
                    ? currentQuestionIndex
                    : questions.length - 1) + 1}{' '}
                  of {questions.length}
                </span>
                <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (((currentQuestionIndex < questions.length
                          ? currentQuestionIndex
                          : questions.length - 1) +
                          1) /
                          questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${isCollectingRespondentInfo ? 'h[100vh]' : 'h-[75vh]'}`}
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'answer'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'info'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'answer'
                        ? 'text-blue-100'
                        : message.type === 'info'
                          ? 'text-green-700'
                          : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {!isCompleted && (
            <div className="border-t border-gray-200 p-4">
              {isCollectingRespondentInfo ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!respondentData.name?.trim()) {
                      toast.error('Name is required to start the survey.')
                      return
                    }
                    if (
                      respondentData.email &&
                      !isEmailValid(respondentData.email)
                    ) {
                      toast.error('Please enter a valid email address.')
                      return
                    }
                    createResponseMutation.mutate({
                      survey_id: surveyId!,
                      respondent_data: {
                        ...respondentData,
                        email:
                          respondentData?.email?.length === 0
                            ? undefined
                            : respondentData?.email,
                      },
                    })
                  }}
                >
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <input
                      type="text"
                      placeholder="Your name (required)"
                      value={respondentData.name || ''}
                      onChange={(e) =>
                        setRespondentData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your email (optional)"
                      value={respondentData.email || ''}
                      onChange={(e) =>
                        setRespondentData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 md:mt-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start Survey
                  </button>
                </form>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  {questions[currentQuestionIndex] &&
                    !questions[currentQuestionIndex].required && (
                      <button
                        onClick={handleSkipQuestion}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="border-t border-gray-200 p-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Survey Completed!
                </h3>
                <p className="text-gray-600">
                  Thank you for your participation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
