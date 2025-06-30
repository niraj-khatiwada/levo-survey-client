import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { surveyApi } from '../../services/api'
import { useParams } from '@tanstack/react-router'
import { Modal } from '@/components/Modal'
import { useState } from 'react'
import { toast } from 'sonner'
import { toLocalDatetime } from '@/utils/datetime'

export function SurveyDetails() {
  const { id } = useParams({ from: '/surveys/$id/' })
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: survey, isLoading: loadingSurvey } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveyApi.getSurveyById(id!),
    enabled: !!id,
  })

  const publishSurveyMutation = useMutation({
    mutationFn: (surveyId: string) => surveyApi.publishSurvey(surveyId),
    onSuccess: () => {
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['survey', id] })
      toast.success('Survey published successfully!')
    },
    onError: (error) => {
      console.error('Error publishing survey:', error)
      toast.error(
        `Error publishing survey: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    },
  })

  const handlePublishSurvey = () => {
    publishSurveyMutation.mutate(id!)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {loadingSurvey ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : survey ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {survey.title}
            </h2>
            <p className="text-gray-600 text-lg">{survey.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Type
                </label>
                <p className="text-gray-900 capitalize">{survey.type}</p>
              </div>

              {survey.external_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External URL
                  </label>
                  <a
                    href={survey.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {survey.external_url}
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      survey.is_draft
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {survey.is_draft ? 'Draft' : 'Published'}
                  </span>
                  {survey.is_draft ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-[2px] bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                    >
                      Publish
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <p className="text-gray-900">
                  {toLocalDatetime(survey.created_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {toLocalDatetime(survey.updated_at)}
                </p>
              </div>
            </div>
            {survey.type === 'internal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Survey URL
                  </label>
                  <div className="flex items-center shrink-0 space-x-4 space-y-4 flex-wrap">
                    <button
                      className="bg-blue-200 px-3 py-1 rounded-md flex items-center whitespace-nowrap cursor-pointer text-sm"
                      onClick={() => {
                        window.navigator.clipboard.writeText(
                          `${window.location.href.endsWith('/') ? window.location.href : window.location.href + '/'}/take`,
                        )
                        toast.success('Copied to clipboard.')
                      }}
                    >
                      🗋 Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Survey not found</p>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-xl font-bold mb-1">
          Are you sure you want to publish this survey?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          All of your recipients will receive the survey in their inbox. If it's
          scheduled, it will be sent out at the scheduled time.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md focus:outline-none focus:ring-2  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            onClick={() => setIsModalOpen(false)}
            disabled={publishSurveyMutation.isPending}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            onClick={handlePublishSurvey}
            disabled={publishSurveyMutation.isPending}
          >
            {publishSurveyMutation.isPending ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
