import { createContext, useContext, useState, ReactNode } from "react"
import { Transaction } from "../utils/types"

interface TransactionApprovalContextType {
    approvedTransactions: Set<string>
    setTransactionApproval: (transactionId: string, approved: boolean) => void
    initializeApprovals: (transactions: Transaction[]) => void
}

const TransactionApprovalContext = createContext<TransactionApprovalContextType | undefined>(undefined)

export function TransactionApprovalProvider({ children }: { children: ReactNode }) {
    const [approvedTransactions, setApprovedTransactions] = useState<Set<string>>(new Set())
    const [isInitialized, setIsInitialized] = useState(false)

    const setTransactionApproval = (transactionId: string, approved: boolean) => {
        setApprovedTransactions(prev => {
            const newSet = new Set(prev)
            if (approved) {
                newSet.add(transactionId)
            } else {
                newSet.delete(transactionId)
            }
            return newSet
        })
    }

    const initializeApprovals = (transactions: Transaction[]) => {
        if (!isInitialized) {
            const initialApprovals = new Set<string>()
            transactions.forEach(transaction => {
                if (transaction.approved) {
                    initialApprovals.add(transaction.id)
                }
            })
            setApprovedTransactions(initialApprovals)
            setIsInitialized(true)
        }
    }

    return (
        <TransactionApprovalContext.Provider value={{ approvedTransactions, setTransactionApproval, initializeApprovals }}>
            {children}
        </TransactionApprovalContext.Provider>
    )
}

export function useTransactionApproval() {
    const context = useContext(TransactionApprovalContext)
    if (context === undefined) {
        throw new Error("useTransactionApproval must be used within a TransactionApprovalProvider")
    }
    return context
} 