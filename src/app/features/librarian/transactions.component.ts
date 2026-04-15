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
import Swal from 'sweetalert2';

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

  async doBorrow(): Promise<void> {
    const sid = this.selectedStudentId();
    const bid = this.selectedBookId();
    if (!sid || !bid) {
      this.message.set('Select student and book.');
      return;
    }
    const result = await this.borrowService.borrow(bid, sid);
    this.message.set(result.message);
    if (result.success) {
      this.selectedBookId.set('');
      Swal.fire({ title: 'Borrowed!', text: result.message, icon: 'success', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ title: 'Failed', text: result.message, icon: 'error' });
    }
  }

  async doReturn(borrowid: string): Promise<void> {
    const result = await this.borrowService.return(borrowid);
    this.message.set(result.message);
    if (result.success) {
      Swal.fire({ title: 'Returned!', text: result.message, icon: 'success', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ title: 'Failed', text: result.message, icon: 'error' });
    }
  }
}
