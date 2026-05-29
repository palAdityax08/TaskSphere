import { useEffect, useState, useRef } from 'react';
import { X, Save, Plus, Calendar, Flag, AlignLeft } from 'lucide-react';

const STAGES = [
  { value: 'todo', label: 'Todo' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'var(--info)' },
  { value: 'medium', label: 'Medium', color: 'var(--warning)' },
  { value: 'high', label: 'High', color: 'var(--danger)' },
];

const DEFAULT_FORM = { title: '', description: '', stage: 'todo', priority: 'medium', dueDate: '' };

export default function TaskModal({ task, defaultStage, onClose, onSave }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const isEdit = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        stage: task.stage || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm({ ...DEFAULT_FORM, stage: defaultStage || 'todo' });
    }
    setTimeout(() => titleRef.current?.focus(), 80);
  }, [task, defaultStage]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 100) errs.title = 'Title is too long';
    if (form.description.length > 500) errs.description = 'Description too long';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        stage: form.stage,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      id="task-modal"
    >
      <div className="modal-panel glass-card">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal" id="modal-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="task-form" noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="task-title"
                ref={titleRef}
                name="title"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="What needs to be done?"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-description">
                <AlignLeft size={12} style={{ display: 'inline', marginRight: 4 }} />
                Description
              </label>
              <textarea
                id="task-description"
                name="description"
                className={`form-input ${errors.description ? 'error' : ''}`}
                placeholder="Add more details…"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {errors.description && <span className="form-error">{errors.description}</span>}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {form.description.length}/500
                </span>
              </div>
            </div>

            <div className="modal-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-stage">Stage</label>
                <select
                  id="task-stage"
                  name="stage"
                  className="form-input"
                  value={form.stage}
                  onChange={handleChange}
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  <Flag size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Priority
                </label>
                <select
                  id="task-priority"
                  name="priority"
                  className="form-input"
                  value={form.priority}
                  onChange={handleChange}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-dueDate">
                <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                Due Date
              </label>
              <input
                id="task-dueDate"
                name="dueDate"
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="modal-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="modal-save">
              {saving
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</>
                : isEdit ? <><Save size={14} /> Save changes</> : <><Plus size={14} /> Add task</>
              }
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-panel {
          width: 100%;
          max-width: 500px;
          box-shadow: var(--shadow-lg), var(--shadow-accent);
          animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 0;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 24px 20px;
        }
        .form-input option {
          background: #1a1a2e;
          color: var(--text-primary);
        }
        @media (max-width: 480px) {
          .modal-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
