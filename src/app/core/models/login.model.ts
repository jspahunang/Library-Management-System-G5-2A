/**
 * Authentication credentials - maps to tblLogin in ERD.
 * One-to-one with User via userid.
 */
export interface Login {
  userid: string;
  password: string;
  email: string;
}
