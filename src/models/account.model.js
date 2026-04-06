class Account {
  constructor({
    id,
    organization_id,
    account_number,
    name,
    account_type,
    currency
  }) {
    this.id = id;
    this.organizationId = organization_id;
    this.accountNumber = account_number;
    this.name = name;
    this.accountType = account_type;
    this.currency = currency;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Account(row);
  }
}

module.exports = Account;