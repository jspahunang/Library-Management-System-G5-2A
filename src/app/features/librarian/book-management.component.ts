import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../core/services/book.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './book-management.component.html',
  styleUrl: './book-management.component.scss',
})
export class BookManagementComponent {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);

  books = computed(() => this.bookService.getAll());
  searchQuery = signal('');
  filteredBooks = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.books();
    if (!q) return list;
    return this.bookService.search(q);
  });

  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    booktitle: ['', Validators.required],
    author: ['', Validators.required],
    isbn: ['', Validators.required],
    category: ['', Validators.required],
    totalCopies: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() { }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ booktitle: '', author: '', isbn: '', category: '', totalCopies: 1 });
    this.showForm.set(true);
  }

  openEdit(book: { bookid: string; booktitle: string; author: string; isbn: string; category: string; totalCopies: number }): void {
    this.editingId.set(book.bookid);
    this.form.patchValue({ booktitle: book.booktitle, author: book.author, isbn: book.isbn, category: book.category, totalCopies: book.totalCopies });
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.bookService.update(id, { booktitle: v.booktitle, author: v.author, isbn: v.isbn, category: v.category, totalCopies: v.totalCopies });
    } else {
      const bookid = `b-${Date.now()}`;
      const existing = this.bookService.getById(bookid);
      const finalId = existing ? `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` : bookid;
      this.bookService.add({
        bookid: finalId,
        booktitle: v.booktitle,
        author: v.author,
        isbn: v.isbn,
        category: v.category,
        availableCopies: v.totalCopies,
        totalCopies: v.totalCopies,
        status: 'Available',
      });
    }
    this.cancelForm();
  }

  delete(bookid: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.delete(bookid);
        Swal.fire({
          title: 'Deleted!',
          text: 'The book has been removed from the catalog.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }

  onSearch(value: string | null | undefined): void {
    this.searchQuery.set(value ?? '');
  }
}

