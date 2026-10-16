import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone,
  Plus,
  Calendar,
  AlertTriangle,
  X,
  Users,
} from 'lucide-react';

export const AnnouncementsManagement: React.FC = () => {
  const { role } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [priority, setPriority] = useState('NORMAL');

  const canPost = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role || '');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({
        title,
        content,
        targetAudience,
        priority,
      });
      setIsAddModalOpen(false);
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Announcements & Bulletins</h2>
          <p className="text-xs text-slate-500">
            Publish school-wide official circulars, event alerts, and parent notifications
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post Circular Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    a.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-800'
                      : a.priority === 'EVENT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {a.priority}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Target: <strong className="text-slate-700">{a.targetAudience}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(a.publishedAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{a.content}</p>

            <div className="pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-100">
              Published by: {a.createdBy}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Announcement */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Post Official Announcement</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Vacation Schedule 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="ALL">All Users</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="PARENTS">Parents Only</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority Tag</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent Notice</option>
                    <option value="EVENT">Special Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Content / Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write announcement text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
