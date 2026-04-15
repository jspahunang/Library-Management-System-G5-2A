# Library Management System (LMS)

A modern, responsive Library Management System built with **Angular** (latest stable), using a dashboard-style layout with sidebar, header, cards, and data tables. Data is stored in **LocalStorage** and is designed for easy migration to **Firebase** (Firestore + Auth) later.

## Tech Stack

- **Angular** (v21+) with standalone components
- **Tailwind CSS** for styling
- **Reactive Forms**
- **TypeScript** with strict typing and interfaces
- **LocalStorage** as the data source (no backend required)

## Project Structure

```
src/app/
├── core/                    # Core module
│   ├── constants/           # Storage keys, nav config
│   ├── data/                # Mock data for LocalStorage seed
│   ├── guards/              # authGuard, roleGuard, guestGuard
│   ├── interceptors/        # authInterceptor (for future Firebase token)
│   ├── models/              # TypeScript interfaces (User, Book, BorrowRecord, etc.)
│   ├── services/            # Auth, User, Book, Borrow, Fine, Notification, Seed
│   └── utils/               # LocalStorage SSR-safe helper
├── shared/
│   └── components/          # StatusBadgeComponent
├── features/
│   ├── login/               # Login page
│   ├── layout/              # Dashboard layout (sidebar + header)
│   ├── student/             # Student dashboard, catalog, borrowed, fines, notifications
│   ├── librarian/           # Librarian dashboard, books, transactions, fines, notifications
│   ├── admin/               # Admin dashboard, user management
│   └── teacher/              # Teacher dashboard, catalog, history
└── app.config.ts, app.routes.ts
```

## How to Run

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   Or:
   ```bash
   ng serve
   ```

3. Open **http://localhost:4200** in your browser.

4. **Login** with one of the demo accounts (password for all: `password123`):
   - **Admin:** admin@lms.edu
   - **Librarian:** librarian@lms.edu
   - **Student:** student@lms.edu
   - **Teacher:** teacher@lms.edu

## Role-Based Access

| Role      | Dashboard | Book catalog | Borrowed books | Fines | Notifications | User mgmt | Book mgmt | Borrow/Return |
|-----------|-----------|--------------|----------------|-------|---------------|-----------|-----------|----------------|
| Admin     | ✓         | —            | —              | —     | —             | ✓         | —         | —              |
| Librarian | ✓         | —            | —              | ✓     | ✓ (send/view) | —         | ✓         | ✓              |
| Student   | ✓         | ✓ (borrow)   | ✓              | ✓     | ✓             | —         | —         | —              |
| Teacher   | ✓         | ✓ (browse)   | —              | —     | —             | —         | —         | — (history)    |

## Data Models (ERD)

Entities: **User**, **Login**, **Admin**, **Librarian**, **Student**, **Teacher**, **Book**, **BorrowRecord**, **Fine**, **Notification**.  
User is the base entity; role-specific tables extend it. Student links to borrow records, fines, and notifications. Book links to borrow records. Fine links to borrow records and students.

## Migrating to Firebase

The app is structured so that **services can be replaced** with Firebase without changing components or routes.

1. **Auth**
   - Replace `AuthService` login/logout with **Firebase Auth** (`signInWithEmailAndPassword`, `signOut`).
   - Store session from `onAuthStateChanged` and keep the same `Session` shape so guards and layout keep working.
   - In `authInterceptor`, attach the Firebase id token:  
     `req = req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } });`

2. **Data services**
   - Each service under `core/services/` has a comment: *"This service is designed to be migrated to Firebase later."*
   - Replace LocalStorage reads/writes with **Firestore** `collection()/doc().get()/set()/update()` (or AngularFire).
   - Keep the same interfaces and method names where possible so components do not need changes.
   - Use the same **STORAGE_KEYS** (or a mapping) as Firestore collection/document IDs if helpful.

3. **Seed data**
   - Remove or run `SeedService.seedIfEmpty()` only once; then rely on Firestore data and Auth users.

4. **Security**
   - Configure **Firestore Security Rules** and **Firebase Auth** so that access is role-based (e.g. only librarians can write to `borrow_records`, only students can read their own `notifications`).

No hardcoded logic in components depends on LocalStorage; all data access goes through services, so swapping to Firebase is done in the service layer.

## Build

```bash
npm run build
```

Output is in `dist/LMS2E/`.

## Notes

- **Borrow:** 14-day loan; overdue fines at ₱10/day.
- **Notifications** are created for: successful borrow, return, overdue fine issued. Librarians can send custom notifications to students.
- **Status badges** are used for Borrow (Borrowed, Overdue, Returned) and Payment (Paid, Unpaid).
