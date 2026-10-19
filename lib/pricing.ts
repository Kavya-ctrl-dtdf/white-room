export const LONG_STAY_MONTHS = 3;
export const LONG_STAY_DISCOUNT = 0.08;
export const FEE_RATE = 0.03;
export const COMMISSION_RATE = 0.1;

export interface Quote {
  /** Rent for this stay's first payment (half a month's rent for a 15-day stay). */
  rent: number;
  discount: number;
  netRent: number;
  gstRate: number;
  gst: number;
  fee: number;
  feeGst: number;
  /** What the guest pays now: one month all in, or the whole 15 days. */
  monthly: number;
  /** Full-month price all in, used for "a month, all in" labels and budgets. */
  perMonth: number;
  total: number;
  months: number;
  longStay: boolean;
  short: boolean;
}

// GST on accommodation up to ₹7,500 a day is 5% (from 22 Sep 2025); above that it is 18%.
// A stay of less than a month (15 days = 0.5) is billed once, at half the monthly rent.
export function quote(rent: number, months: number): Quote {
  const short = months < 1;
  const longStay = months >= LONG_STAY_MONTHS;
  const chargeRent = short ? Math.round(rent * months) : rent;
  const discount = longStay ? Math.round(chargeRent * LONG_STAY_DISCOUNT) : 0;
  const netRent = chargeRent - discount;
  const gstRate = rent / 30 <= 7500 ? 0.05 : 0.18;
  const gst = Math.round(netRent * gstRate);
  const fee = Math.round(chargeRent * FEE_RATE);
  const feeGst = Math.round(fee * 0.18);
  const monthly = netRent + gst + fee + feeGst;
  return {
    rent: chargeRent,
    discount,
    netRent,
    gstRate,
    gst,
    fee,
    feeGst,
    monthly,
    perMonth: short ? quote(rent, 1).monthly : monthly,
    total: short ? monthly : monthly * months,
    months,
    longStay,
    short,
  };
}

export function ownerPayout(rent: number, months: number) {
  const gross = Math.round(rent * months);
  const commission = Math.round(gross * COMMISSION_RATE);
  return { gross, commission, net: gross - commission };
}
