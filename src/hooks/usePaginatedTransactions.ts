import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    // Don't fetch if we've reached the end of the data
    if (paginatedTransactions?.nextPage === null) {
      return
    }

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }

      // Merge the new transactions with existing ones, preserving approval states
      const mergedData = [...previousResponse.data]
      response.data.forEach((newTransaction) => {
        const existingIndex = mergedData.findIndex(t => t.id === newTransaction.id)
        if (existingIndex === -1) {
          mergedData.push(newTransaction)
        } else {
          // Preserve the existing transaction's approval state
          mergedData[existingIndex] = {
            ...newTransaction,
            approved: mergedData[existingIndex].approved
          }
        }
      })

      return {
        data: mergedData,
        nextPage: response.nextPage
      }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
