// API service for communicating with the Flask backend

const API_BASE_URL = import.meta.env.VITE_API_URL

interface SurveyData {
  title: string
  description: string
  type: string
  external_url?: string
  is_draft: boolean
}

interface QuestionData {
  text: string
  required: boolean
  order: number
}

interface DistributionData {
  recipient_emails: string[]
  subject: string
  message: string
  scheduled_at?: string
}

export interface Survey {
  id: string
  title: string
  description: string
  type: string
  external_url?: string
  is_draft: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

interface ApiResponse<T> {
  data: T | null
  message?: string
  error?: string
}

// Survey API
export const surveyApi = {
  async getSurveys(
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedResponse<Survey>> {
    const response = await fetch(
      `${API_BASE_URL}/surveys/?page=${page}&per_page=${perPage}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getSurveyById(id: string): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async createSurvey(surveyData: SurveyData): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async publishSurvey(id: string): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },
}

// Questions API
export const questionsApi = {
  async getQuestionsBySurveyId(surveyId: string): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/questions/by-survey/${surveyId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async createBulkQuestions(
    surveyId: string,
    questions: QuestionData[],
  ): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/questions/bulk-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        survey_id: surveyId,
        questions: questions,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async createQuestion(
    questionData: QuestionData & { survey_id: string },
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/questions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },
}

// Distribution API
export const distributionApi = {
  async getDistributionsBySurveyId(surveyId: string): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/distribution/by-survey/${surveyId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async createBulkDistribution(
    distributionData: DistributionData & { survey_id: string },
  ): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/distribution/bulk-distribution`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...distributionData,
          method: 'EMAIL', // Assuming EMAIL is the distribution method
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },
  async incrementClickedCount(distributionId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/distribution/${distributionId}/clicked`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },
}

// Responses API
export const responsesApi = {
  async createResponse(data: {
    survey_id: string
    respondent_data?: any
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/responses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    return responseData
  },

  async submitAnswers(responseId: string, answers: any[]): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/responses/${responseId}/answers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getSurveyQuestions(surveyId: string): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/responses/survey/${surveyId}/questions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getResponsesBySurvey(
    surveyId: string,
    page = 1,
    pageSize = 20,
  ): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/responses/survey/${surveyId}/responses?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getResponseAnswers(responseId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/responses/${responseId}/answers`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getSurveyAnalytics(surveyId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/responses/survey/${surveyId}/analytics`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getDailyResponses(surveyId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/responses/survey/${surveyId}/analytics/daily-responses`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  async getQuestionAnalytics(surveyId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/responses/survey/${surveyId}/analytics/question-analytics`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },
}

// Query keys for TanStack Query
export const queryKeys = {
  surveys: {
    all: ['surveys'] as const,
    lists: () => [...queryKeys.surveys.all, 'list'] as const,
    list: (filters: { page: number; perPage: number }) =>
      [...queryKeys.surveys.lists(), filters] as const,
  },
}
