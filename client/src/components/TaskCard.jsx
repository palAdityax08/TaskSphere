import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react';

const PRIORITY_COLORS = {
  low: { bg: 'var(--info-light)', color: 'var(--info)', label: 'Low' },
  medium: { bg: 'var(--warning-light)', color: 'var(--warning)', label: 'Medium' },
  high: { bg: 'var(--danger-light)', color: 'var(--danger)', label: 'High' },
};

function formatDate(dateStr, stage) {
  if (!dateStr) return null;
  if (stage === 'done') {
    const d = new Date(dateStr);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, overdue: false };
  }

  let d;
  if (typeof dateStr === 'string' && dateStr.includes('-') && !dateStr.includes('T')) {
    const parts = dateStr.split('-');
    d = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    d = new Date(dateStr);
  }

  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Set both to midnight local time to compare calendar days robustly
  const dueDateLocal = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);

  const overdue = dueDateLocal < todayLocal;
  return { label, overdue };
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const date = formatDate(task.dueDate, task.stage);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      id={`task-${task._id}`}
    >
      <div className="task-card-inner glass-card">
        <div className="task-drag-handle" {...attributes} {...listeners} aria-label="Drag task">
          <GripVertical size={14} />
        </div>

        <div className="task-card-body">
          <p className="task-title">{task.title}</p>
          {task.description && (
            <p className="task-desc">{task.description}</p>
          )}
        </div>

        <div className="task-card-footer">
          <div className="task-meta">
            <span
              className="task-priority-badge"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </span>
            {date && (
              <span className={`task-due ${date.overdue ? 'overdue' : ''}`}>
                <Calendar size={11} />
                {date.label}
                {date.overdue && ' (overdue)'}
              </span>
            )}
          </div>

          <div className="task-actions">
            <button
              className="btn-icon task-action-btn"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              title="Edit"
              id={`edit-task-${task._id}`}
            >
              <Pencil size={13} />
            </button>
            <button
              className="btn-icon task-action-btn danger"
              onClick={() => onDelete(task._id)}
              aria-label="Delete task"
              title="Delete"
              id={`delete-task-${task._id}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .task-card {
          position: relative;
          cursor: default;
        }
        .task-card.dragging .task-card-inner {
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), var(--shadow-accent);
        }
        .task-card-inner {
          padding: 14px;
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
        }
        .task-card-inner::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0;
          transition: opacity var(--transition);
        }
        .task-card-inner:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .task-card-inner:hover::before {
          opacity: 1;
        }
        .task-drag-handle {
          position: absolute;
          top: 10px; right: 10px;
          color: var(--text-muted);
          cursor: grab;
          opacity: 0;
          transition: opacity var(--transition);
          padding: 2px;
          border-radius: 4px;
        }
        .task-drag-handle:active { cursor: grabbing; }
        .task-card-inner:hover .task-drag-handle { opacity: 1; }
        .task-card-body {
          margin-bottom: 12px;
          margin-right: 20px;
        }
        .task-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          word-break: break-word;
        }
        .task-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 5px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .task-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .task-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .task-priority-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .task-due {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .task-due.overdue {
          color: var(--danger);
        }
        .task-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity var(--transition);
        }
        .task-card-inner:hover .task-actions { opacity: 1; }
        .task-action-btn {
          width: 26px; height: 26px;
          padding: 0;
          border-radius: 6px;
          color: var(--text-muted);
        }
        .task-action-btn:hover { color: var(--accent-light); background: var(--accent-glow); }
        .task-action-btn.danger:hover { color: var(--danger); background: var(--danger-light); }
      `}</style>
    </div>
  );
}
