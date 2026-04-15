import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { BorrowService } from '../../core/services/borrow.service';
import type { User, Student, BorrowRecord } from '../../core/models';
import { MOCK_STUDENTS, MOCK_USERS, MOCK_BORROW_RECORDS } from '../../core/data/mock-data';

interface StudentInfo {
  user: User;
  student: Student | undefined;
  activeBorrows: BorrowRecord[];
}

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-students.component.html',
  styleUrl: './teacher-students.component.scss',
})
export class TeacherStudentsComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private borrowService = inject(BorrowService);

  ngOnInit(): void {
    // Component initialization here if needed. Data is now synced automatically by Firestore!
  }

  studentsData = computed<StudentInfo[]>(() => {
    const studentUsers = this.userService.getByRole('Student');
    return studentUsers.map(user => {
      const student = this.roleService.getStudentByUserId(user.userid);
      const activeBorrows = student 
        ? this.borrowService.getActiveByStudent(student.studentid)
        : [];
      return { user, student, activeBorrows };
    });
  });
}
