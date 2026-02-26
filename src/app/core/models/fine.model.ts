/**
 * Fine entity - maps to tblFine in ERD.
 * Many-to-one with Student and BorrowRecord.
 */
export type PaymentStatus = 'Paid' | 'Unpaid';

export interface Fine {
  fineid: string;
  studentid: string;
  borrowid: string;
  fineamount: number;
  paymentstatus: PaymentStatus;
  daysOverdue: number;
  paymentdate: string | null; // ISO date when paid
}
