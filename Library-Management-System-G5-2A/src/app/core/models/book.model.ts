/**
 * Book entity - maps to tblBook in ERD.
 * Links to BorrowRecord (one-to-many).
 */
export interface Book {
  bookid: string;
  booktitle: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  status: 'Available' | 'Borrowed Out' | 'Lost';
}
