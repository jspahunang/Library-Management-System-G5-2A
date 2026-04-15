import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BorrowService } from '../../core/services/borrow.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-teacher-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-history.component.html',
  styleUrl: './teacher-history.component.scss',
})
export class TeacherHistoryComponent {
  /** Teachers don't have studentid in our mock - they share User. For demo we show empty or could link teacher to borrows if we had tblTeacherBorrow. */
  records = computed(() => []);

  constructor(
    private auth: AuthService,
    private roleService: RoleService,
    private borrowService: BorrowService
  ) {}
}
