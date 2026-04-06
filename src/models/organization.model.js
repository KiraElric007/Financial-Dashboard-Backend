class Organization {
  constructor({ id, name, code, created_at }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.createdAt = created_at;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Organization(row);
  }
}

module.exports = Organization;