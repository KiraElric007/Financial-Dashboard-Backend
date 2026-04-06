class Department {
  constructor({ id, organization_id, code, name }) {
    this.id = id;
    this.organizationId = organization_id;
    this.code = code;
    this.name = name;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Department(row);
  }
}

module.exports = Department;