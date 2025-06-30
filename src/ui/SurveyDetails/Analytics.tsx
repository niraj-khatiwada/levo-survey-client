import { useQuery } from '@tanstack/react-query'
import { responsesApi } from '../../services/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsProps {
  surveyId: string
}

export function Analytics({ surveyId }: AnalyticsProps) {
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['survey-analytics', surveyId],
    queryFn: () => responsesApi.getSurveyAnalytics(surveyId),
  })

  const { data: dailyResponses, isLoading: loadingDaily } = useQuery({
    queryKey: ['daily-responses', surveyId],
    queryFn: () => responsesApi.getDailyResponses(surveyId),
  })

  const { data: questionAnalytics, isLoading: loadingQuestions } = useQuery({
    queryKey: ['question-analytics', surveyId],
    queryFn: () => responsesApi.getQuestionAnalytics(surveyId),
  })

  if (loadingAnalytics || loadingDaily || loadingQuestions) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    )
  }

  const responseStats = analytics.response_stats
  const distributionStats = analytics.distribution_stats
  const recentActivity = analytics.recent_activity

  // Prepare data for charts
  const dailyData =
    dailyResponses?.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      responses: item.count,
    })) || []

  const completionRateData =
    questionAnalytics?.map((q: any) => ({
      question:
        q.question_text.substring(0, 30) +
        (q.question_text.length > 30 ? '...' : ''),
      completionRate: q.completion_rate,
      answered: q.answered,
      skipped: q.skipped,
    })) || []

  const distributionData = [
    { name: 'Sent', value: distributionStats.sent, color: '#0088FE' },
    { name: 'Opened', value: distributionStats.opened, color: '#00C49F' },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Responses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {responseStats.total_responses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {responseStats.completion_rate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentActivity.last_7_days}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributionStats.open_rate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Responses Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Response Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#0088FE"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribution Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question Completion Rates */}
      {completionRateData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Question Completion Rates
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={completionRateData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="question" type="category" width={200} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Completion Rate']}
              />
              <Bar dataKey="completionRate" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Response Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Responses:</span>
              <span className="font-medium">
                {responseStats.total_responses}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Responses:</span>
              <span className="font-medium">
                {responseStats.completed_responses}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Internal Responses:</span>
              <span className="font-medium">
                {responseStats.internal_responses}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">External Responses:</span>
              <span className="font-medium">
                {responseStats.external_responses}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Responses (7 days):</span>
              <span className="font-medium">
                {responseStats.recent_responses}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribution Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Distributions:</span>
              <span className="font-medium">{distributionStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sent:</span>
              <span className="font-medium">{distributionStats.sent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opened:</span>
              <span className="font-medium">{distributionStats.opened}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clicked:</span>
              <span className="font-medium">{distributionStats.clicked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Click Rate:</span>
              <span className="font-medium">
                {distributionStats.click_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
