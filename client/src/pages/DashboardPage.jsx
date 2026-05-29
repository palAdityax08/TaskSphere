import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { toast } from 'react-hot-toast';
import { tasksAPI } from '../api';
import Navbar from '../components/Navbar';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, Search, X, LayoutDashboard } from 'lucide-react';

const STAGES = ['todo', 'inprogress', 'done'];

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ open: false, task: null, stage: 'todo' });
  const [activeTask, setActiveTask] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await tasksAPI.getAll();
      setTasks(data.tasks);
    } catch {
      setError('Failed to load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const getTasksByStage = (stage) => {
    const filtered = search.trim()
      ? tasks.filter(
          (t) =>
            t.stage === stage &&
            (t.title.toLowerCase().includes(search.toLowerCase()) ||
              t.description?.toLowerCase().includes(search.toLowerCase()))
        )
      : tasks.filter((t) => t.stage === stage);
    return filtered;
  };

  const handleSaveTask = async (formData) => {
    try {
      if (modalState.task) {
        const { data } = await tasksAPI.update(modalState.task._id, formData);
        setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
        toast.success('Task updated');
      } else {
        const { data } = await tasksAPI.create(formData);
        setTasks((prev) => [data.task, ...prev]);
        toast.success('Task created');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await tasksAPI.remove(id);
      toast.success('Task deleted');
    } catch {
      await loadTasks();
      toast.error('Could not delete task');
    } finally {
      setDeletingId(null);
    }
  };

  const findTaskStage = (taskId) =>
    tasks.find((t) => t._id === taskId)?.stage;

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t._id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeStage = findTaskStage(activeId);
    const overStage = STAGES.includes(overId) ? overId : findTaskStage(overId);

    if (!activeStage || !overStage) return;

    if (activeStage === overStage && activeId !== overId) {
      setTasks((prev) => {
        const stageTasks = prev.filter((t) => t.stage === activeStage);
        const otherTasks = prev.filter((t) => t.stage !== activeStage);
        const oldIndex = stageTasks.findIndex((t) => t._id === activeId);
        const newIndex = stageTasks.findIndex((t) => t._id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return [...otherTasks, ...arrayMove(stageTasks, oldIndex, newIndex)];
      });
    } else if (activeStage !== overStage) {
      setTasks((prev) =>
        prev.map((t) => (t._id === activeId ? { ...t, stage: overStage } : t))
      );
      try {
        await tasksAPI.update(activeId, { stage: overStage });
        toast.success(`Moved to ${overStage === 'inprogress' ? 'In Progress' : overStage.charAt(0).toUpperCase() + overStage.slice(1)}`);
      } catch {
        await loadTasks();
        toast.error('Failed to update task stage');
      }
    }
  };

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.stage === 'done').length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-title-row">
            <div>
              <div className="dashboard-eyebrow">
                <LayoutDashboard size={14} />
                <span>Workspace</span>
              </div>
              <h1 className="dashboard-title">My Tasks</h1>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setModalState({ open: true, task: null, stage: 'todo' })}
              id="new-task-button"
            >
              <Plus size={16} />
              New Task
            </button>
          </div>

          {totalCount > 0 && (
            <div className="progress-row">
              <div className="progress-info">
                <span className="progress-label">{doneCount} of {totalCount} tasks completed</span>
                <span className="progress-pct">{progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="search-row">
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="task-search"
                aria-label="Search tasks"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="board-loading">
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p>Loading your tasks…</p>
          </div>
        ) : error ? (
          <div className="board-error">
            <p>{error}</p>
            <button className="btn btn-ghost" onClick={loadTasks}>Try again</button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board" id="kanban-board">
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  tasks={getTasksByStage(stage)}
                  onAddTask={(s) => setModalState({ open: true, task: null, stage: s })}
                  onEditTask={(task) => setModalState({ open: true, task, stage: task.stage })}
                  onDeleteTask={handleDelete}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <div style={{ transform: 'rotate(2deg)', opacity: 0.95, pointerEvents: 'none' }}>
                  <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {modalState.open && (
        <TaskModal
          task={modalState.task}
          defaultStage={modalState.stage}
          onClose={() => setModalState({ open: false, task: null, stage: 'todo' })}
          onSave={handleSaveTask}
        />
      )}

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .dashboard-main {
          flex: 1;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 24px 48px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dashboard-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .dashboard-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .dashboard-title {
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .progress-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .progress-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .progress-pct {
          font-size: 13px;
          font-weight: 700;
          color: var(--success);
        }
        .progress-bar-track {
          height: 5px;
          background: var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--success));
          border-radius: 10px;
          transition: width 0.5s ease;
        }
        .search-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          max-width: 360px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 9px 36px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all var(--transition);
        }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }
        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color var(--transition);
        }
        .search-clear:hover { color: var(--text-secondary); }
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }
        .board-loading, .board-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-height: 400px;
          color: var(--text-secondary);
          font-size: 15px;
        }
        @media (max-width: 900px) {
          .kanban-board {
            grid-template-columns: 1fr;
          }
          .dashboard-title { font-size: 24px; }
        }
        @media (max-width: 600px) {
          .dashboard-main { padding: 16px 16px 32px; }
          .dashboard-title-row { flex-direction: column; }
          .search-wrap { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
