import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { questionsApi } from '../../services/api'
import { toast } from 'sonner'
import Loader from '../../components/Loader'

interface QuestionsStepProps {
  surveyId: string
  onQuestionsAdded: () => void
  onPrev: () => void
}

interface Question {
  text: string
  required: boolean
  order: number
}

export function QuestionsStep({
  surveyId,
  onQuestionsAdded,
}: QuestionsStepProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState({ text: '', required: false })

  const createQuestionsMutation = useMutation({
    mutationFn: ({
      surveyId,
      questions,
    }: {
      surveyId: string
      questions: Question[]
    }) => questionsApi.createBulkQuestions(surveyId, questions),
    onSuccess: () => {
      onQuestionsAdded()
      toast.success('Questions added successfully')
    },
    onError: (error) => {
      console.error('Error creating questions:', error)
      toast.error(
        `Error creating questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    },
  })

  const addQuestion = () => {
    if (newQuestion.text.trim()) {
      const question: Question = {
        text: newQuestion.text.trim(),
        required: newQuestion.required,
        order: questions.length,
      }
      setQuestions([...questions, question])
      setNewQuestion({ text: '', required: false })
    }
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    // Reorder the remaining questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      order: i,
    }))
    setQuestions(reorderedQuestions)
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...questions]
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1)
    updatedQuestions.splice(toIndex, 0, movedQuestion)

    // Reorder all questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      order: i,
    }))
    setQuestions(reorderedQuestions)
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question before proceeding.')
      return
    }

    createQuestionsMutation.mutate({ surveyId, questions })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Survey Questions
        </h2>
        <p className="text-gray-600 mb-6">Add questions to your survey.</p>
      </div>

      {/* Add New Question */}
      <div className="bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add New Question
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="question-text"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question Text
            </label>
            <textarea
              id="question-text"
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, text: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question here..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="question-required"
              checked={newQuestion.required}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, required: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="question-required"
              className="ml-2 block text-sm text-gray-700"
            >
              Required
            </label>
          </div>

          <button
            onClick={addQuestion}
            disabled={!newQuestion.text.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Questions ({questions.length})
        </h3>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions added yet. Add your first question above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(index, 'text', e.target.value)
                        }
                        rows={2}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(index, 'required', e.target.checked)
                          }
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">
                          Required
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {index > 0 && (
                      <button
                        onClick={() => moveQuestion(index, index - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Move up"
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
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {index < questions.length - 1 && (
                      <button
                        onClick={() => moveQuestion(index, index + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Move down"
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
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove question"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <div />
        <button
          onClick={handleSubmit}
          disabled={questions.length === 0 || createQuestionsMutation.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {createQuestionsMutation.isPending ? (
            <>
              <Loader />
              <span>Adding Questions...</span>
            </>
          ) : (
            <span>Next: Distribution</span>
          )}
        </button>
      </div>
    </div>
  )
}
