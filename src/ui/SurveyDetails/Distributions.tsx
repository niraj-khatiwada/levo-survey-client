import { useQuery } from '@tanstack/react-query'
import { distributionApi } from '../../services/api'
import { DataTable } from '../../components/Table/DataTable'
import { useParams } from '@tanstack/react-router'
import { toLocalDatetime } from '@/utils/datetime'
export function Distributions() {
  const { id } = useParams({ from: '/surveys/$id/' })

  const { data: distributions, isLoading: loadingDistributions } = useQuery({
    queryKey: ['distributions', id],
    queryFn: () => distributionApi.getDistributionsBySurveyId(id!),
    enabled: !!id,
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Survey Distributions
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          All distributions sent for this survey
        </p>
      </div>
      {loadingDistributions ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : distributions ? (
        <div className="p-6">
          <DataTable
            columns={[
              {
                key: 'recipient_email',
                header: 'Recipient',
                render: (value: string) => (
                  <div className="max-w-xs">
                    {value.length > 0 ? (
                      <div className="space-y-1">{value}</div>
                    ) : (
                      <span className="text-gray-400">No recipients</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'subject',
                header: 'Subject',
                render: (value: string) => (
                  <div className="max-w-md truncate" title={value}>
                    {value}
                  </div>
                ),
              },
              {
                key: 'message',
                header: 'Message',
                render: (value: string) => (
                  <div className="max-w-xs truncate" title={value}>
                    {value}
                  </div>
                ),
              },
              {
                key: 'scheduled_at',
                header: 'Scheduled At',
                render: (value: string | null) => (
                  <span className="text-sm text-gray-500">
                    {value ? toLocalDatetime(value) : 'Immediate'}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (value: string) => (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      value === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : value === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {value || 'Unknown'}
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
            data={distributions || []}
            loading={loadingDistributions}
          />
        </div>
      ) : null}
    </div>
  )
}
