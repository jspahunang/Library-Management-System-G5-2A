import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { BookService } from '../../core/services/book.service';
import { BorrowService } from '../../core/services/borrow.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  totalUsers = computed(() => this.userService.getAll().length);
  totalBooks = computed(() => this.bookService.getAll().length);
  activeBorrows = computed(() => this.borrowService.getBorrowedCount());
  usersByRole = computed(() => {
    const users = this.userService.getAll();
    return {
      Admin: users.filter((u) => u.role === 'Admin').length,
      Librarian: users.filter((u) => u.role === 'Librarian').length,
      Student: users.filter((u) => u.role === 'Student').length,
      Teacher: users.filter((u) => u.role === 'Teacher').length,
    };
  });

  constructor(
    private userService: UserService,
    private bookService: BookService,
    private borrowService: BorrowService
  ) {}
}
