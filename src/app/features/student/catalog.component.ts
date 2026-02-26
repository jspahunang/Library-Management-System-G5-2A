import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { BorrowService } from '../../core/services/borrow.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  searchQuery = signal('');
  books = computed(() => {
    const q = this.searchQuery().trim();
    return q ? this.bookService.search(q) : this.bookService.getAll();
  });

  studentId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getStudentByUserId(session.userid)?.studentid : null;
  });

  message = signal('');

  constructor(
    private auth: AuthService,
    private bookService: BookService,
    private borrowService: BorrowService,
    private roleService: RoleService
  ) {}

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  borrow(bookId: string): void {
    const sid = this.studentId();
    if (!sid) {
      this.message.set('Not logged in as student.');
      return;
    }
    const result = this.borrowService.borrow(bookId, sid);
    this.message.set(result.message);
  }
}
