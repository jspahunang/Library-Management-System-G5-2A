/**
 * Base user entity - maps to tblUser in ERD.
 * Role-specific tables (Admin, Librarian, Student, Teacher) extend this via userid FK.
 */
export interface User {
  userid: string;
  Fname: string;
  Minitial: string;
  Lname: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  role: 'Admin' | 'Librarian' | 'Student' | 'Teacher';
}

export type UserRole = User['role'];
