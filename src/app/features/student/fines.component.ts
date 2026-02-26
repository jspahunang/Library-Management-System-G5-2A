import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { FineService } from '../../core/services/fine.service';
import { RoleService } from '../../core/services/role.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './fines.component.html',
  styleUrl: './fines.component.scss',
})
export class FinesComponent {
  studentId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getStudentByUserId(session.userid)?.studentid : null;
  });

  fines = computed(() => {
    const sid = this.studentId();
    return sid ? this.fineService.getByStudent(sid) : [];
  });

  totalUnpaid = computed(() => {
    const sid = this.studentId();
    return sid ? this.fineService.getTotalUnpaidAmount(sid) : 0;
  });

  constructor(
    private auth: AuthService,
    private roleService: RoleService,
    private fineService: FineService
  ) {}
}
