class Budget {
  constructor({
    id,
    organization_id,
    department_id,
    fiscal_year,
    quarter,
    budget_amount,
    forecast_amount,
    actual_amount,
    variance_amount,
    currency,
    notes
  }) {
    this.id = id;
    this.organizationId = organization_id;
    this.departmentId = department_id;
    this.fiscalYear = fiscal_year;
    this.quarter = quarter;
    this.budgetAmount = Number(budget_amount || 0);
    this.forecastAmount = forecast_amount != null ? Number(forecast_amount) : null;
    this.actualAmount = actual_amount != null ? Number(actual_amount) : null;
    this.varianceAmount = variance_amount != null ? Number(variance_amount) : null;
    this.currency = currency;
    this.notes = notes;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Budget(row);
  }
}

module.exports = Budget;