import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '../../services/api'
import { DataTable } from '../../components/Table/DataTable'
import { useParams } from '@tanstack/react-router'
import { toLocalDatetime } from '@/utils/datetime'

export function Questions() {
  const { id } = useParams({ from: '/surveys/$id/' })

  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['questions', id],
    queryFn: () => questionsApi.getQuestionsBySurveyId(id!),
    enabled: !!id,
  })
  if (!id) {
    return <div className="p-6">Survey ID not found</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Survey Questions</h2>
        <p className="text-sm text-gray-600 mt-1">
          All questions associated with this survey
        </p>
      </div>
      {loadingQuestions ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : questions ? (
        <div className="p-6">
          <DataTable
            columns={[
              {
                key: 'text',
                header: 'Question Text',
                render: (value: string) => (
                  <div className="max-w-md truncate" title={value}>
                    {value}
                  </div>
                ),
              },
              {
                key: 'required',
                header: 'Required',
                render: (value: boolean) => (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      value
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {value ? 'Yes' : 'No'}
                  </span>
                ),
              },
              {
                key: 'created_at',
                header: 'Created',
                render: (value: string) => (
                  <span className="text-sm text-gray-500">
                    {toLocalDatetime(value)}
                  </span>
                ),
              },
            ]}
            data={questions || []}
            loading={loadingQuestions}
          />
        </div>
      ) : null}
    </div>
  )
}
