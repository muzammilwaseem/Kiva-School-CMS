import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Library,
  Search,
  Plus,
  Book,
  CheckCircle,
  Clock,
  X,
  User,
} from 'lucide-react';

export const LibraryManagement: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: 'Science',
    totalCopies: 5,
    rackNumber: 'Rack S-1',
  });

  const [students, setStudents] = useState<any[]>([]);
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueDueDate, setIssueDueDate] = useState('2026-10-25');

  useEffect(() => {
    loadBooks();
    loadStudents();
  }, [category]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const data = await api.getBooks(params);
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const st = await api.getStudents({ status: 'ACTIVE' });
      setStudents(st);
      if (st.length > 0) setIssueStudentId(String(st[0].id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBook(newBook);
      setIsAddBookModalOpen(false);
      loadBooks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      await api.issueBook({
        bookId: selectedBook.id,
        borrowerType: 'STUDENT',
        studentId: Number(issueStudentId),
        dueDate: issueDueDate,
      });
      setIsIssueModalOpen(false);
      loadBooks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReturnBook = async (borrowId: number) => {
    try {
      await api.returnBook(borrowId);
      alert('Book marked as returned successfully!');
      loadBooks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Library Catalog & Circulation</h2>
          <p className="text-xs text-slate-500">
            Book repository, accession tracking, copy availability, and issue/return desk
          </p>
        </div>

        <button
          onClick={() => setIsAddBookModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book Copy</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search book title, author, ISBN, accession code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBooks()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-lg focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="Science & Astronomy">Science & Astronomy</option>
          <option value="Urdu Literature">Urdu Literature</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Islamic History">Islamic History</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {b.accessionNo}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  b.availableCopies > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {b.availableCopies} / {b.totalCopies} Available
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{b.title}</h3>
              <p className="text-xs text-slate-500">By {b.author}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Category: <strong>{b.category}</strong> • Rack: <strong>{b.rackNumber || 'General'}</strong>
              </p>

              {b.borrows?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Currently Borrowed By:</span>
                  {b.borrows.map((br: any) => (
                    <div key={br.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded">
                      <span className="font-medium text-slate-800">
                        {br.student ? `${br.student.firstName} ${br.student.lastName}` : br.staff?.firstName}
                      </span>
                      <button
                        onClick={() => handleReturnBook(br.id)}
                        className="text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        Return Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end">
              {b.availableCopies > 0 && (
                <button
                  onClick={() => {
                    setSelectedBook(b);
                    setIsIssueModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs"
                >
                  Issue to Student
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Book */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Add Book to Library Catalog</h3>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Total Copies</label>
                  <input
                    type="number"
                    value={newBook.totalCopies}
                    onChange={(e) => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddBookModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Book */}
      {isIssueModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Issue "{selectedBook.title}"</h3>
            <form onSubmit={handleIssueBook} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Select Student *</label>
                <select
                  value={issueStudentId}
                  onChange={(e) => setIssueStudentId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.admissionNo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Return Due Date</label>
                <input
                  type="date"
                  value={issueDueDate}
                  onChange={(e) => setIssueDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsIssueModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
