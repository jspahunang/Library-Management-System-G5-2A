/**
 * Borrow record - maps to tblBorrowRecord in ERD.
 * Many-to-one with Book and Student; one-to-many with Fine.
 */
export type BorrowStatus = 'Borrowed' | 'Returned' | 'Overdue';

export interface BorrowRecord {
  borrowid: string;
  bookid: string;
  studentid: string;
  booktitle: string;
  borrowdate: string; // ISO date
  duedate: string;
  returndate: string | null;
  status: BorrowStatus;
}
