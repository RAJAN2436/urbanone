/**
 * Strict Order-to-Customer Ownership Verification.
 * Returns true if and only if the order demonstrably belongs to the specified customer.
 * Prevents cross-account order leakage, multi-window collision on localhost, and dummy fallback mismatches.
 */
export const isOrderOwnedByCustomer = (order, customer) => {
  if (!order || !customer) return false;

  // Ignore mock/demo seed orders that have dummy prefix
  if (typeof order.id === 'string' && (order.id.startsWith('demo-') || order.id.startsWith('mock-'))) {
    return false;
  }

  // 1. Primary check: Unique Customer ID (from MongoDB or session)
  const custId = customer.id || customer._id;
  const ordCustId = order.customerId || order.customer_id;
  if (custId && ordCustId && String(custId).trim() === String(ordCustId).trim()) {
    return true;
  }

  // 2. Secondary check: Authenticated Email (case-insensitive, exact match, non-empty)
  const custEmail = (customer.email || '').trim().toLowerCase();
  const ordEmail = (order.customerEmail || order.customer_email || '').trim().toLowerCase();
  if (custEmail && ordEmail && custEmail.includes('@') && custEmail === ordEmail) {
    return true;
  }

  // 3. Tertiary check: Valid 10-digit Phone Number (never match dummy numbers)
  const custDigits = (customer.phone || '').replace(/\D/g, '').slice(-10);
  const ordDigits = (order.customerPhone || order.customer_phone || '').replace(/\D/g, '').slice(-10);
  const DUMMY_PHONES = ['9845011223', '9876543210', '0000000000', '1234567890'];

  if (
    custDigits.length === 10 &&
    ordDigits.length === 10 &&
    custDigits === ordDigits &&
    !DUMMY_PHONES.includes(custDigits)
  ) {
    return true;
  }

  return false;
};
