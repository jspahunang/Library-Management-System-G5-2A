/**
 * LocalStorage keys for LMS data.
 * When migrating to Firebase, these can be replaced by Firestore collection names.
 */
export const STORAGE_KEYS = {
  USERS: 'lms_users',
  LOGINS: 'lms_logins',
  ADMINS: 'lms_admins',
  LIBRARIANS: 'lms_librarians',
  STUDENTS: 'lms_students',
  TEACHERS: 'lms_teachers',
  BOOKS: 'lms_books',
  BORROW_RECORDS: 'lms_borrow_records',
  FINES: 'lms_fines',
  NOTIFICATIONS: 'lms_notifications',
  SESSION: 'lms_session',
} as const;
