// src/utils/validation.js

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

/**
 * Strict YYYY-MM-DD validation (calendar-correct, leap years etc.)
 */
function isValidDateOnly(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return false;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Build UTC date and round-trip check components
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Strict YYYY-MM-DD[ T]HH:mm[:ss] validation.
 * Accepts space or 'T' as separator (e.g. "2020-01-02 10:00:00").
 */
function isValidDateTime(dateTimeStr) {
  if (typeof dateTimeStr !== 'string') return false;
  const trimmed = dateTimeStr.trim();
  const parts = trimmed.split(/[T ]/);
  if (parts.length !== 2) return false;

  const [datePart, timePart] = parts;

  if (!isValidDateOnly(datePart)) return false;

  const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timePart);
  if (!t) return false;

  const hour = Number(t[1]);
  const minute = Number(t[2]);
  const second = t[3] ? Number(t[3]) : 0;

  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  if (second < 0 || second > 59) return false;

  const [year, month, day] = datePart.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day &&
    d.getUTCHours() === hour &&
    d.getUTCMinutes() === minute &&
    d.getUTCSeconds() === second
  );
}

/**
 * Simple year validation for analytics (e.g. 1900–2100).
 */
function isValidAnalyticsYear(value) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= 2100;
}

/**
 * -------- Body/query validators (throw 400 on invalid) --------
 */

function validateLoginBody(body) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    throw validationError('email and password are required');
  }
}

function validateUserCreateBody(body) {
  if (!body) throw validationError('Body is required');

  const { email, fullName, password } = body;

  if (typeof email !== 'string' || !(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.exec(email))) {
    throw validationError('Valid email is required');
  }
  if (typeof fullName !== 'string' || !fullName.trim()) {
    throw validationError('fullName is required');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw validationError('password must be at least 6 characters');
  }
}

function validateAccountCreateBody(body) {
  if (!body) throw validationError('Body is required');

  const { accountNumber, name, accountType, currency } = body;

  if (typeof accountNumber !== 'string' || !accountNumber.trim()) {
    throw validationError('accountNumber (string) is required');
  }
  if (typeof name !== 'string' || !name.trim()) {
    throw validationError('name is required');
  }
  if (typeof accountType !== 'string' || !accountType.trim()) {
    throw validationError('accountType is required');
  }
  if (typeof currency !== 'string' || !currency.trim()) {
    throw validationError('currency is required');
  }
}

function validateTransactionCreateBody(body) {
  if (!body) throw validationError('Body is required');

  const { txnDate, accountId, currency, debitAmount, creditAmount } = body;

  if (!isValidDateTime(txnDate)) {
    throw validationError('txnDate must be a valid datetime (YYYY-MM-DD HH:mm[:ss])');
  }
  if (!Number.isInteger(accountId)) {
    throw validationError('accountId must be an integer');
  }
  if (typeof currency !== 'string' || !currency.trim()) {
    throw validationError('currency is required');
  }

  if (
    debitAmount != null &&
    typeof debitAmount !== 'number'
  ) {
    throw validationError('debitAmount must be a number if provided');
  }
  if (
    creditAmount != null &&
    typeof creditAmount !== 'number'
  ) {
    throw validationError('creditAmount must be a number if provided');
  }
}

function validateTransactionUpdateBody(body) {
  if (!body) return;

  if (body.txnDate !== undefined && !isValidDateTime(body.txnDate)) {
    throw validationError('txnDate must be a valid datetime');
  }
  if (body.accountId !== undefined && !Number.isInteger(body.accountId)) {
    throw validationError('accountId must be an integer');
  }
  if (body.currency !== undefined && (typeof body.currency !== 'string' || !body.currency.trim())) {
    throw validationError('currency must be a non-empty string');
  }
}

/**
 * Analytics validators
 */
function validateBudgetVsActualQuery(query) {
  const { year } = query || {};
  if (year !== undefined && !isValidAnalyticsYear(year)) {
    throw validationError('year must be between 1900 and 2100');
  }
}

function validateDateRangeQuery(query, { allowEmpty = false } = {}) {
  const { from, to } = query || {};

  if (!allowEmpty && (!from || !to)) {
    throw validationError('from and to are required');
  }

  if (from && !isValidDateOnly(from)) {
    throw validationError('from must be a valid date (YYYY-MM-DD)');
  }
  if (to && !isValidDateOnly(to)) {
    throw validationError('to must be a valid date (YYYY-MM-DD)');
  }
}

module.exports = {
  validationError,
  isValidDateOnly,
  isValidDateTime,
  isValidAnalyticsYear,
  validateLoginBody,
  validateUserCreateBody,
  validateAccountCreateBody,
  validateTransactionCreateBody,
  validateTransactionUpdateBody,
  validateBudgetVsActualQuery,
  validateDateRangeQuery
};