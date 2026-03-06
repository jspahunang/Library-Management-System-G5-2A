import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../core/services/borrow.service';
import { BookService } from '../../core/services/book.service';
import { RoleService } from '../../core/services/role.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, TableModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {
  mode = signal<'borrow' | 'return'>('borrow');
  message = signal('');
  selectedStudentId = signal('');
  selectedBookId = signal('');

  students = computed(() => this.roleService.getStudents());
  books = computed(() => this.bookService.getAll().filter((b) => b.availableCopies > 0));
  activeBorrows = computed(() => this.borrowService.getAll().filter((b) => b.status === 'Borrowed' || b.status === 'Overdue'));

  studentOptions = computed(() => this.students().map(s => ({
    label: `Student ${s.studentid} (Year ${s.yearLevel})`,
    value: s.studentid
  })));

  bookOptions = computed(() => this.books().map(b => ({
    label: `${b.booktitle} (${b.availableCopies} left)`,
    value: b.bookid
  })));

  constructor(
    private borrowService: BorrowService,
    private bookService: BookService,
    private roleService: RoleService
  ) { }

  doBorrow(): void {
    const sid = this.selectedStudentId();
    const bid = this.selectedBookId();
    if (!sid || !bid) {
      this.message.set('Select student and book.');
      return;
    }
    const result = this.borrowService.borrow(bid, sid);
    this.message.set(result.message);
    if (result.success) {
      this.selectedBookId.set('');
    }
  }

  doReturn(borrowid: string): void {
    const result = this.borrowService.return(borrowid);
    this.message.set(result.message);
  }
}
