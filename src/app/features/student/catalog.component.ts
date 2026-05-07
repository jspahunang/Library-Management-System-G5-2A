import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { BorrowService } from '../../core/services/borrow.service';
import { RoleService } from '../../core/services/role.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  searchQuery = signal('');
  books = computed(() => {
    const q = this.searchQuery().trim();
    return q ? this.bookService.search(q) : this.bookService.getAll();
  });

  userIdForBorrow = computed(() => {
    const session = this.auth.currentSession();
    if (!session) return null;
    if (session.role === 'Teacher') {
      return this.roleService.getTeacherByUserId(session.userid)?.teacherid;
    }
    return this.roleService.getStudentByUserId(session.userid)?.studentid;
  });

  message = signal('');

  constructor(
    private auth: AuthService,
    private bookService: BookService,
    private borrowService: BorrowService,
    private roleService: RoleService
  ) { }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  async borrow(bookId: string): Promise<void> {
    const sid = this.userIdForBorrow();
    if (!sid) {
      this.message.set('Not logged in with a valid borrowing role or missing profile.');
      return;
    }
    const result = await this.borrowService.borrow(bookId, sid);
    this.message.set(result.message);
  }
}
