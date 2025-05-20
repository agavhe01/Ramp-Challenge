import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)
  const [previousApprovals, setPreviousApprovals] = useState<Map<string, boolean>>(new Map())

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )

      // Store current approval states before updating
      if (transactionsByEmployee) {
        const approvals = new Map<string, boolean>()
        transactionsByEmployee.forEach(transaction => {
          approvals.set(transaction.id, transaction.approved)
        })
        setPreviousApprovals(approvals)
      }

      // Apply previous approval states to new transactions
      const updatedData = data === null ? [] : data.map(transaction => ({
        ...transaction,
        approved: previousApprovals.get(transaction.id) ?? transaction.approved
      }))

      setTransactionsByEmployee(updatedData)
    },
    [fetchWithCache, transactionsByEmployee, previousApprovals]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  return { data: transactionsByEmployee, loading, fetchById, invalidateData }
}
