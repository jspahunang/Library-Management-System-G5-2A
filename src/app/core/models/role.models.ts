/**
 * Role-specific entities - map to tblAdmin, tblLibrarian, tblStudent, tblTeacher.
 * Each has PK and userid FK referencing User.
 */
export interface Admin {
  adminid: string;
  userid: string;
}

export interface Librarian {
  librarianid: string;
  userid: string;
}

export interface Student {
  studentid: string; // ERD has "stucientid" - normalized to studentid in code
  userid: string;
  yearLevel: number; // yearlvi in ERD
}

export interface Teacher {
  teacherid: string;
  userid: string;
  department: string;
}
