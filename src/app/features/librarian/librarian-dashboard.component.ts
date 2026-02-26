import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BorrowService } from '../../core/services/borrow.service';
import { FineService } from '../../core/services/fine.service';
import { BookService } from '../../core/services/book.service';
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

  constructor(
    private borrowService: BorrowService,
    private fineService: FineService,
    private bookService: BookService
  ) {}
}
