import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BorrowService } from '../../core/services/borrow.service';
import { FineService } from '../../core/services/fine.service';
import { BookService } from '../../core/services/book.service';
import { UserService } from '../../core/services/user.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-librarian-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './librarian-dashboard.component.html',
  styleUrl: './librarian-dashboard.component.scss',
})
export class LibrarianDashboardComponent {
  borrowedCount = computed(() => this.borrowService.getBorrowedCount());
  overdueCount = computed(() => this.borrowService.getOverdue().length);
  totalFinesUnpaid = computed(() => this.fineService.getTotalUnpaidAmount());
  totalBooks = computed(() => this.bookService.getAll().length);

  overdueRecords = computed(() => this.borrowService.getOverdue().slice(0, 5));

  private userService = inject(UserService);

  constructor(
    private borrowService: BorrowService,
    private fineService: FineService,
    private bookService: BookService
  ) { }

  downloadMonthlyReport(): void {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // User Data
    const users = this.userService.getAll();
    const activeUsers = users.filter((u) => u.status === 'Active').length;
    const adminCount = users.filter((u) => u.role === 'Admin').length;
    const librarianCount = users.filter((u) => u.role === 'Librarian').length;
    const studentCount = users.filter((u) => u.role === 'Student').length;
    const teacherCount = users.filter((u) => u.role === 'Teacher').length;

    // Book Data
    const books = this.bookService.getAll();
    const totalTitles = books.length;
    let totalPhysicalCopies = 0;
    let totalAvailableCopies = 0;
    let totalBorrowedCopies = 0;
    let bookTableMD = '| ISBN | Book Title | Author | Category | Available / Total |\n| :--- | :--- | :--- | :--- | :--- |\n';

    books.forEach(b => {
      totalPhysicalCopies += b.totalCopies;
      totalAvailableCopies += b.availableCopies;
      totalBorrowedCopies += (b.totalCopies - b.availableCopies);
      bookTableMD += `| ${b.isbn} | ${b.booktitle} | ${b.author} | ${b.category} | ${b.availableCopies} / ${b.totalCopies} |\n`;
    });

    // Borrow/Fine Data
    const borrows = this.borrowService.getAll();
    const activeBorrows = borrows.filter(b => b.status === 'Borrowed' || b.status === 'Overdue');
    let activeBorrowsCount = activeBorrows.length;

    let borrowTableMD = '| Borrow ID | Book Title | Borrower ID | Borrow Date | Due Date | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n';
    borrows.forEach(b => {
      borrowTableMD += `| ${b.borrowid} | ${b.booktitle} | ${b.studentid} | ${b.borrowdate} | ${b.duedate} | ${b.status} |\n`;
    });

    const fines = this.fineService.getAll();
    const totalIssued = fines.reduce((sum, f) => sum + f.fineamount, 0);
    const finesUnpaid = fines.filter(f => f.paymentstatus === 'Unpaid');
    const totalUnpaid = finesUnpaid.reduce((sum, f) => sum + f.fineamount, 0);
    const totalPaid = totalIssued - totalUnpaid;

    let fineListMD = '';
    fines.forEach(f => {
      fineListMD += `- **${f.paymentstatus === 'Paid' ? 'Paid' : 'Outstanding'} Fine:** ₱${f.fineamount.toFixed(2)} from Student ${f.studentid} (${f.daysOverdue} days overdue). ${f.paymentstatus === 'Paid' ? `Paid on ${f.paymentdate}.` : '**Status: Unpaid.**'}\n`;
    });
    if (fineListMD === '') fineListMD = '- No fine records exist.\n';

    const reportContent = `# Monthly Library Status Report

**Date Prepared:** ${today}  
**Prepared By:** Librarian  
**To:** Admin  
**Reporting Period:** Current Status Overview  

---

## 1. User Status Overview
The library system currently has **${activeUsers} active users** registered across all roles.

**User Breakdown by Role:**
- **Admin:** ${adminCount}
- **Librarian:** ${librarianCount}
- **Students:** ${studentCount}
- **Teachers:** ${teacherCount}

---

## 2. Book Inventory & Circulation
There are currently **${totalTitles} book titles** managed in the system, totaling **${totalPhysicalCopies} physical copies**.

**Inventory Status:**
- **Total Available Copies:** ${totalAvailableCopies}
- **Total Borrowed/Unavailable Copies:** ${totalBorrowedCopies}

### Detailed Book Inventory
${bookTableMD}

---

## 3. Borrowing Activity
A total of **${borrows.length} borrow transactions** were recorded in the system for this period. 

${borrowTableMD}

---

## 4. Fines & Overdue Status
The library tracks overdue items to ensure timely returns. Currently, there are **${fines.length} fine records** associated with overdue books.

**Financial Overview:**
- **Total Fines Issued:** ₱${totalIssued.toFixed(2)}
- **Total Fines Collected (Paid):** ₱${totalPaid.toFixed(2)}
- **Outstanding Balance (Unpaid):** ₱${totalUnpaid.toFixed(2)}

**Details of Fines:**
${fineListMD}

---

### End of Report
**Remarks:** Please review the unpaid fines, as well as the unread notifications from our students regarding their currently overdue books. Follow-up emails will be arranged if items are not returned within the next week.
`;

    // Create a Blob and download it
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_library_report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

