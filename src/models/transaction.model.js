class Transaction {
  constructor({
    id,
    organization_id,
    txn_date,
    account_id,
    department_id,
    cost_center_id,
    description,
    debit_amount,
    credit_amount,
    currency,
    status,
    created_by,
    approved_by,
    created_at,
    approved_at
  }) {
    this.id = id;
    this.organizationId = organization_id;
    this.txnDate = txn_date;
    this.accountId = account_id;
    this.departmentId = department_id;
    this.costCenterId = cost_center_id;
    this.description = description;
    this.debitAmount = Number(debit_amount || 0);
    this.creditAmount = Number(credit_amount || 0);
    this.currency = currency;
    this.status = status;
    this.createdBy = created_by;
    this.approvedBy = approved_by;
    this.createdAt = created_at;
    this.approvedAt = approved_at;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Transaction(row);
  }
}

module.exports = Transaction;