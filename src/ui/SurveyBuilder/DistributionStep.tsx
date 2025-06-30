import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { distributionApi } from '../../services/api'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { toLocalISOWithTz } from '../../utils/datetime'
import { isEmailValid } from '../../utils/email'
interface DistributionStepProps {
  surveyId: string
  onDistributionCreated: () => void
  onPrev: () => void
}

interface DistributionData {
  recipient_emails: string[]
  subject: string
  message: string
  scheduled_at?: string
}

export function DistributionStep({
  surveyId,
  onDistributionCreated,
}: DistributionStepProps) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<DistributionData>({
    recipient_emails: [],
    subject: '',
    message: '',
  })
  const [newEmail, setNewEmail] = useState('')
  const [errors, setErrors] = useState<Partial<DistributionData>>({})

  const createDistributionMutation = useMutation({
    mutationFn: (data: DistributionData & { survey_id: string }) =>
      distributionApi.createBulkDistribution(data),
    onSuccess: () => {
      onDistributionCreated()
      navigate({ to: `/surveys/${surveyId}` })
    },
    onError: (error) => {
      console.error('Error creating distribution:', error)
      toast.error(
        `Error creating distribution: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    },
  })

  const addEmail = () => {
    if (newEmail.trim() && isEmailValid(newEmail.trim())) {
      const emails = [...formData.recipient_emails, newEmail.trim()].filter(
        (email, index, self) => self.indexOf(email) === index,
      )
      setFormData((prev) => ({ ...prev, recipient_emails: emails }))
      setNewEmail('')
    }
  }

  const removeEmail = (index: number) => {
    const emails = formData.recipient_emails.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, recipient_emails: emails }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<DistributionData> = {}

    if (formData.recipient_emails.length === 0) {
      newErrors.recipient_emails = ['At least one recipient email is required']
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    createDistributionMutation.mutate({
      ...formData,
      survey_id: surveyId,
      scheduled_at: Boolean(formData.scheduled_at)
        ? toLocalISOWithTz(formData.scheduled_at!)
        : undefined,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }

  const updateField = (field: keyof DistributionData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Distribute Survey
        </h2>
        <p className="text-gray-600 mb-6">
          Send your survey to recipients via email.
        </p>
      </div>

      <div className="space-y-4">
        {/* Recipient Emails */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Emails *
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
            <button
              onClick={addEmail}
              disabled={!newEmail.trim() || !isEmailValid(newEmail.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {formData.recipient_emails.length > 0 && (
            <div className="space-y-2">
              {formData.recipient_emails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    onClick={() => removeEmail(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              ))}
            </div>
          )}

          {errors.recipient_emails && (
            <p className="mt-1 text-sm text-red-600">
              {errors.recipient_emails.join(', ')}
            </p>
          )}
        </div>

        {/* Email Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email subject"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Email Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email message..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="scheduled_at"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Schedule Send (Optional)
          </label>
          <input
            type="datetime-local"
            id="scheduled_at"
            value={formData.scheduled_at || ''}
            onChange={(e) => updateField('scheduled_at', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to send immediately
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <div />
        <div className="flex space-x-2">
          <button
            onClick={() => {
              navigate({ to: `/surveys/${surveyId}` })
            }}
            disabled={createDistributionMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={createDistributionMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {createDistributionMutation.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Creating Distribution...</span>
              </>
            ) : (
              <span>Create & Distribute Survey</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
