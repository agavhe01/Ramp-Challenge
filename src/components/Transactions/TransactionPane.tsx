import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"
import { useTransactionApproval } from "../../context/TransactionApprovalContext"

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const { approvedTransactions, setTransactionApproval } = useTransactionApproval()
  const isApproved = approvedTransactions.has(transaction.id)

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={isApproved}
        disabled={loading}
        onChange={async (newValue) => {
          try {
            await consumerSetTransactionApproval({
              transactionId: transaction.id,
              newValue,
            })
            setTransactionApproval(transaction.id, newValue)
          } catch (error) {
            // If the API call fails, revert the checkbox state
            setTransactionApproval(transaction.id, !newValue)
          }
        }}
      />
    </div>
  )
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
