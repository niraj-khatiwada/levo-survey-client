import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { surveyApi, queryKeys, type Survey } from '../../services/api'
import { toast } from 'sonner'
import Loader from '../../components/Loader'

interface SurveyData {
  id?: string
  title: string
  description: string
  type: 'internal' | 'external'
  external_url?: string
  is_draft: boolean
}

interface SurveyStepProps {
  onSurveyCreated: (survey: Survey) => void
}

export function SurveyStep({ onSurveyCreated }: SurveyStepProps) {
  const [formData, setFormData] = useState<SurveyData>({
    title: '',
    description: '',
    type: 'internal',
    is_draft: false,
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof SurveyData, string>>
  >({})

  const queryClient = useQueryClient()

  const createSurveyMutation = useMutation({
    mutationFn: surveyApi.createSurvey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.lists() })
      onSurveyCreated(data)
      toast.success('Survey created successfully')
    },
    onError: (error) => {
      console.error('Error creating survey:', { error })
      toast.error(
        `Error creating survey: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    },
  })

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SurveyData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.type) {
      newErrors.type = 'Survey type is required'
    }

    if (formData.type === 'external' && !formData.external_url?.trim()) {
      newErrors.external_url = 'External URL is required for external surveys'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    createSurveyMutation.mutate(formData)
  }

  const updateField = (field: keyof SurveyData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Survey Details
        </h2>
        <p className="text-gray-600 mb-6">
          Create the basic information for your survey.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Survey Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter survey title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter survey description"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Survey Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => updateField('type', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select survey type</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {formData.type === 'external' && (
          <div>
            <label
              htmlFor="external_url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              External URL *
            </label>
            <input
              type="url"
              id="external_url"
              value={formData.external_url || ''}
              onChange={(e) => updateField('external_url', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.external_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/survey"
            />
            {errors.external_url && (
              <p className="mt-1 text-sm text-red-600">{errors.external_url}</p>
            )}
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_draft"
            checked={formData.is_draft}
            onChange={(e) => updateField('is_draft', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_draft"
            className="ml-2 block text-sm text-gray-700"
          >
            Save as draft
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          disabled={createSurveyMutation.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {createSurveyMutation.isPending ? (
            <>
              <Loader />
              <span>Creating Survey...</span>
            </>
          ) : (
            <span>Next: Add Questions</span>
          )}
        </button>
      </div>
    </div>
  )
}
