import type { User } from '../models/user.model';
import type { Login } from '../models/login.model';
import type { Admin, Librarian, Student, Teacher } from '../models/role.models';
import type { Book } from '../models/book.model';
import type { BorrowRecord } from '../models/borrow.model';
import type { Fine } from '../models/fine.model';
import type { Notification } from '../models/notification.model';

/** Mock users (tblUser) */
export const MOCK_USERS: User[] = [
  { userid: 'u1', Fname: 'Jerick', Minitial: 'P.', Lname: 'Signapan', email: 'admin@lms.edu', phone: '09123456789', status: 'Active', role: 'Admin' },
  { userid: 'u2', Fname: 'John Simon', Minitial: 'A.', Lname: 'Pahunang', email: 'librarian@lms.edu', phone: '09234567891', status: 'Active', role: 'Librarian' },
  { userid: 'u3', Fname: 'Jackrey', Minitial: 'H.', Lname: 'Natingga', email: 'student@lms.edu', phone: '09345678912', status: 'Active', role: 'Student' },
  { userid: 'u4', Fname: 'Crystal Donn', Minitial: 'C.', Lname: 'Sarasara', email: 'teacher@lms.edu', phone: '09456789123', status: 'Active', role: 'Teacher' },
  { userid: 'u5', Fname: 'Stephen', Minitial: 'A.', Lname: 'Jalagat', email: 'student2@lms.edu', phone: '09567891234', status: 'Active', role: 'Student' },
];

/** Mock logins (tblLogin) - password for all: password123 */
export const MOCK_LOGINS: Login[] = [
  { userid: 'u1', email: 'admin@lms.edu', password: 'password123' },
  { userid: 'u2', email: 'librarian@lms.edu', password: 'password123' },
  { userid: 'u3', email: 'student@lms.edu', password: 'password123' },
  { userid: 'u4', email: 'teacher@lms.edu', password: 'password123' },
  { userid: 'u5', email: 'student2@lms.edu', password: 'password123' },
];

/** Role-specific records */
export const MOCK_ADMINS: Admin[] = [{ adminid: 'a1', userid: 'u1' }];
export const MOCK_LIBRARIANS: Librarian[] = [{ librarianid: 'lib1', userid: 'u2' }];
export const MOCK_STUDENTS: Student[] = [
  { studentid: 's1', userid: 'u3', yearLevel: 3 },
  { studentid: 's2', userid: 'u5', yearLevel: 2 },
];
export const MOCK_TEACHERS: Teacher[] = [{ teacherid: 't1', userid: 'u4', department: 'Mathematics' }];

/** Mock books */
export const MOCK_BOOKS: Book[] = [
  { bookid: 'b1', booktitle: 'Introduction to Algorithms', author: 'Cormen et al.', isbn: '978-0262046305', category: 'Computer Science', availableCopies: 3, totalCopies: 5, status: 'Available' },
  { bookid: 'b2', booktitle: 'Clean Code', author: 'Robert Martin', isbn: '978-0132350884', category: 'Programming', availableCopies: 2, totalCopies: 4, status: 'Available' },
  { bookid: 'b3', booktitle: 'The Philippine History', author: 'Teodoro Agoncillo', isbn: '978-9718711064', category: 'History', availableCopies: 5, totalCopies: 5, status: 'Available' },
  { bookid: 'b4', booktitle: 'Noli Me Tangere', author: 'Jose Rizal', isbn: '978-0143039693', category: 'Literature', availableCopies: 4, totalCopies: 6, status: 'Available' },
  { bookid: 'b5', booktitle: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1337613927', category: 'Mathematics', availableCopies: 2, totalCopies: 3, status: 'Available' },
];

/** Mock borrow records (some active, some returned) */
export const MOCK_BORROW_RECORDS: BorrowRecord[] = [
  { borrowid: 'br1', bookid: 'b1', studentid: 's1', booktitle: 'Introduction to Algorithms', borrowdate: '2025-02-01', duedate: '2025-02-15', returndate: null, status: 'Borrowed' },
  { borrowid: 'br2', bookid: 'b2', studentid: 's1', booktitle: 'Clean Code', borrowdate: '2025-01-20', duedate: '2025-02-03', returndate: '2025-02-10', status: 'Returned' },
  { borrowid: 'br3', bookid: 'b4', studentid: 's2', booktitle: 'Noli Me Tangere', borrowdate: '2025-02-05', duedate: '2025-02-19', returndate: null, status: 'Borrowed' },
];

/** Mock fines */
export const MOCK_FINES: Fine[] = [
  { fineid: 'f1', studentid: 's1', borrowid: 'br2', fineamount: 70, paymentstatus: 'Paid', daysOverdue: 7, paymentdate: '2025-02-11' },
  { fineid: 'f2', studentid: 's1', borrowid: 'br1', fineamount: 60, paymentstatus: 'Unpaid', daysOverdue: 6, paymentdate: null },
];

/** Mock notifications */
export const MOCK_NOTIFICATIONS: Notification[] = [
  { notificationid: 'n1', studentid: 's1', messageTitle: 'Book borrowed', message: 'You borrowed "Introduction to Algorithms". Due date: 2025-02-15.', timestamp: '2025-02-01T10:00:00Z', read: false },
  { notificationid: 'n2', studentid: 's1', messageTitle: 'Overdue fine issued', message: 'Returned "Clean Code" 7 day(s) overdue. A fine of ₱70 has been issued.', timestamp: '2025-02-10T14:00:00Z', read: true },
  { notificationid: 'n3', studentid: 's2', messageTitle: 'Book borrowed', message: 'You borrowed "Noli Me Tangere". Due date: 2025-02-19.', timestamp: '2025-02-05T09:00:00Z', read: false },
];
