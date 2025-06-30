import { useQuery } from '@tanstack/react-query'
import { responsesApi } from '../../services/api'
import { toLocalDatetime } from '@/utils/datetime'

interface Answer {
  id: string
  question_id: string
  question_text: string
  question_type: string
  value?: string
  values?: string[]
  rating?: number
  date_value?: string
  created_at: string
}

interface ResponseAnswers {
  response_id: string
  respondent_name?: string
  respondent_email?: string
  created_at: string
  completed_at?: string
  answers: Answer[]
  distribution?: {
    id: string
    recipient_method: string
    recipient_email: string
    status: string
    scheduled_at: string
  }
}
interface ResponseAnswersModalProps {
  responseId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ResponseAnswersModal({
  responseId,
  isOpen,
  onClose,
}: ResponseAnswersModalProps) {
  const { data, isLoading, error } = useQuery<ResponseAnswers>({
    queryKey: ['response-answers', responseId],
    queryFn: () => responsesApi.getResponseAnswers(responseId!),
    enabled: !!responseId && isOpen,
  })

  if (!isOpen) return null

  const formatAnswerValue = (answer: Answer) => {
    if (answer.value) return answer.value
    if (answer.values && answer.values.length > 0)
      return answer.values.join(', ')
    if (answer.rating) return `${answer.rating}/10`
    if (answer.date_value)
      return new Date(answer.date_value).toLocaleDateString()
    return 'No answer provided'
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Response Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">
                Error loading response details: {(error as Error).message}
              </p>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Response Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Response Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Response ID:
                    </span>
                    <span className="ml-2 font-mono text-gray-600">
                      {data.response_id}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Respondent:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {data.respondent_name || 'Anonymous'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-600">
                      {data.respondent_email || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Submitted:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {toLocalDatetime(data.created_at)}
                    </span>
                  </div>
                  {data.completed_at && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Completed:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {toLocalDatetime(data.completed_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {data.distribution ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Distribution Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Distribution ID:
                      </span>
                      <span className="ml-2 font-mono text-gray-600">
                        {data.distribution.id}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Recipient Method:
                      </span>
                      <span className="ml-2 text-gray-600 capitalize">
                        {data.distribution.recipient_method}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Recipient Email:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {data.distribution.recipient_email}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-600 capitalize">
                        {data.distribution.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              {/* Answers */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Answers ({data.answers.length})
                </h4>
                <div className="space-y-4">
                  {data.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500 capitalize">
                          {answer.question_type}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {answer.question_text}
                      </p>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <span className="font-medium text-gray-700">
                          Answer:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {formatAnswerValue(answer)}
                        </span>
                      </div>
                    </div>
                  ))}{' '}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
