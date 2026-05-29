import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus, ClipboardList, Loader, CheckCircle2, Circle } from 'lucide-react';

const COLUMN_CONFIG = {
  todo: {
    label: 'Todo',
    icon: Circle,
    accent: '#8b5cf6',
    accentLight: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.2)',
  },
  inprogress: {
    label: 'In Progress',
    icon: Loader,
    accent: '#f59e0b',
    accentLight: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    accent: '#10b981',
    accentLight: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
};

export default function KanbanColumn({ stage, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const config = COLUMN_CONFIG[stage];
  const Icon = config.icon;

  return (
    <div
      className={`kanban-col ${isOver ? 'drop-over' : ''}`}
      style={{ '--col-accent': config.accent, '--col-accent-light': config.accentLight, '--col-border': config.border }}
    >
      <div className="col-header">
        <div className="col-title-group">
          <Icon size={16} style={{ color: config.accent }} strokeWidth={2} />
          <h2 className="col-title">{config.label}</h2>
          <span className="col-count">{tasks.length}</span>
        </div>
        <button
          className="btn-add-task"
          onClick={() => onAddTask(stage)}
          aria-label={`Add task to ${config.label}`}
          id={`add-task-${stage}`}
          title="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`col-body ${tasks.length === 0 ? 'empty' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 16px' }}>
              <ClipboardList size={32} />
              <p>No tasks here yet.<br />Click + to add one.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>

      <style>{`
        .kanban-col {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          min-height: 400px;
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
        }
        .kanban-col::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--col-accent);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }
        .kanban-col.drop-over {
          background: var(--col-accent-light);
          border-color: var(--col-border);
          box-shadow: 0 0 0 2px var(--col-border), inset 0 0 32px var(--col-accent-light);
        }
        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 16px 12px;
          border-bottom: 1px solid var(--border);
        }
        .col-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .col-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--text-primary);
        }
        .col-count {
          background: var(--col-accent-light);
          color: var(--col-accent);
          border: 1px solid var(--col-border);
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 20px;
          min-width: 22px;
          text-align: center;
        }
        .btn-add-task {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          background: var(--col-accent-light);
          color: var(--col-accent);
          border: 1px solid var(--col-border);
          transition: all var(--transition);
        }
        .btn-add-task:hover {
          background: var(--col-accent);
          color: #fff;
          transform: scale(1.1);
        }
        .col-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          overflow-y: auto;
          min-height: 200px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .col-body::-webkit-scrollbar { width: 4px; }
        .col-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .col-body.empty {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
