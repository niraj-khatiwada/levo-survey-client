import { useQuery } from '@tanstack/react-query'
import { responsesApi } from '../../services/api'
import { useState } from 'react'
import { DataTable } from '../../components/Table/DataTable'
import { toLocalDatetime } from '@/utils/datetime'
import { ResponseAnswersModal } from './ResponseAnswersModal'

interface Response {
  id: string
  respondent_name?: string
  respondent_email?: string
  source: 'internal' | 'external'
  created_at: string
  distribution_id?: string
  completed_at?: string
}

interface ResponsesData {
  total: number
  pages: number
  page_size: number
  items: Response[]
}

const pageSize = 20

export function Responses({ surveyId }: { surveyId: string }) {
  const [page, setPage] = useState(1)
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery<ResponsesData>({
    queryKey: ['survey-responses', surveyId, page, pageSize],
    queryFn: () => responsesApi.getResponsesBySurvey(surveyId, page, pageSize),
  })

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading responses: {(error as Error).message}
        </p>
      </div>
    )
  }

  const responses = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.pages || 0

  const truncateId = (id: string) => {
    return id.substring(0, 8) + '...'
  }

  const handleRowClick = (response: Response) => {
    setSelectedResponseId(response.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedResponseId(null)
  }

  const columns = [
    {
      key: 'id' as keyof Response,
      header: 'Response ID',
      render: (value: string) => (
        <span className="font-mono text-gray-900">{truncateId(value)}</span>
      ),
    },
    {
      key: 'respondent_name' as keyof Response,
      header: 'Respondent',
      render: (_: string, row: Response) => (
        <p>
          Name: {row.respondent_name ?? 'N/A'}
          <br />
          Email: {row?.respondent_email ?? 'N/A'}
        </p>
      ),
    },
    {
      key: 'source' as keyof Response,
      header: 'Source',
      render: (value: string) => (
        <span className="text-gray-500 capitalize">{value}</span>
      ),
    },
    {
      key: 'distribution_id' as keyof Response,
      header: 'Distribution',
      render: (value: string) => (
        <span className="text-gray-500">{value ? truncateId(value) : '-'}</span>
      ),
    },
    {
      key: 'created_at' as keyof Response,
      header: 'Submitted At',
      render: (value: string) => (
        <span className="text-gray-500">{toLocalDatetime(value)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Survey Responses
        </h2>
        <div className="text-sm text-gray-500">Total: {total} responses</div>
      </div>

      <DataTable
        data={responses}
        columns={columns}
        loading={isLoading}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: pageSize,
          onPageChange: setPage,
        }}
        emptyMessage="No responses yet for this survey."
        onRowClick={handleRowClick}
      />

      <ResponseAnswersModal
        responseId={selectedResponseId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
