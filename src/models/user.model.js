class User {
  constructor({
    id,
    organization_id,
    email,
    full_name,
    password_hash,
    is_active,
    created_at
  }) {
    this.id = id;
    this.organizationId = organization_id;
    this.email = email;
    this.fullName = full_name;
    this.passwordHash = password_hash;
    this.isActive = !!is_active;
    this.createdAt = created_at;
  }

  static fromRow(row) {
    if (!row) return null;
    return new User(row);
  }

  toSafeJSON() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      email: this.email,
      fullName: this.fullName,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;