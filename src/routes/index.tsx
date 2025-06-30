import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Navbar } from '../components/Navbar/Navbar'
import { DataTable } from '../components/Table/DataTable'
import { surveyApi } from '../services/api'
import { toLocalDatetime } from '@/utils/datetime'

interface Survey {
  id: string
  title: string
  description: string
  type: string
  external_url?: string
  is_draft: boolean
  created_at: string
  updated_at: string
}

export const Route = createFileRoute('/')({
  component: SurveysPage,
})

function SurveysPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<keyof Survey | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const itemsPerPage = 10

  const {
    data: surveysResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['surveys', currentPage, itemsPerPage],
    queryFn: () => surveyApi.getSurveys(currentPage, itemsPerPage),
  })

  const handleSort = (key: keyof Survey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const columns = [
    {
      key: 'title' as keyof Survey,
      header: 'Title',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'type' as keyof Survey,
      header: 'Type',
      sortable: true,
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'internal'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'is_draft' as keyof Survey,
      header: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {value ? 'Draft' : 'Published'}
        </span>
      ),
    },
    {
      key: 'created_at' as keyof Survey,
      header: 'Created At',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-500">{toLocalDatetime(value)}</span>
      ),
    },
  ]

  const surveys = surveysResponse?.items || []
  const totalItems = surveysResponse?.total || 0
  const totalPages = surveysResponse?.pages || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view all your surveys
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/survey-builder"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Survey
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading surveys
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error instanceof Error
                    ? error.message
                    : 'An unknown error occurred'}
                </div>
              </div>
            </div>
          </div>
        )}

        <DataTable
          data={surveys}
          columns={columns}
          loading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
          sorting={{
            sortBy,
            sortOrder,
            onSort: handleSort,
          }}
          emptyMessage="No surveys found. Create your first survey to get started!"
          onRowClick={(row) => {
            navigate({
              to: '/surveys/$id',
              params: { id: row.id },
            })
          }}
        />
      </div>
    </div>
  )
}
