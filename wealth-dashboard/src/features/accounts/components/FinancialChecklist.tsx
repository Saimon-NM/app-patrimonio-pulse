import { useEffect, useMemo, useState } from 'react';
import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import type { Account, Provider } from '@/features/accounts/model/provider.types';
import InfoIcon from '@/shared/components/InfoIcon';
import { financialInputBase } from '@/shared/styles/tokens';

type FlatTask = {
  id: string;
  label: string;
  done: boolean;
  providerId: string;
  accountId: string;
  accountName: string;
  providerName: string;
};

type FilterMode = 'all' | 'pending' | 'done';

interface FinancialChecklistProps {
  providers: Provider[];
  onAccountMetaChange: (providerId: string, accountId: string, updates: Partial<Account>) => void;
}

const FinancialChecklist: FC<FinancialChecklistProps> = ({ providers, onAccountMetaChange }) => {
  const [taskText, setTaskText] = useState('');
  const [targetProviderId, setTargetProviderId] = useState<string>('');
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [query, setQuery] = useState('');
  const [actionToast, setActionToast] = useState(false);

  useEffect(() => {
    if (!actionToast) return;
    const t = setTimeout(() => setActionToast(false), 1200);
    return () => clearTimeout(t);
  }, [actionToast]);

  const tasks = useMemo<FlatTask[]>(() => {
    const out: FlatTask[] = [];
    for (const provider of providers) {
      for (const account of provider.accounts) {
        const list = account.checklist ?? [];
        for (const item of list) {
          out.push({
            id: item.id,
            label: item.label,
            done: item.done,
            providerId: provider.id,
            accountId: account.id,
            accountName: account.name,
            providerName: provider.name,
          });
        }
      }
    }
    // Pendientes primero; luego orden alfabético para estabilidad visual.
    out.sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);
      return a.label.localeCompare(b.label, 'es');
    });
    return out;
  }, [providers]);

  const visibleTasks = useMemo(() => {
    let out = tasks;
    if (filter === 'pending') out = out.filter((t) => !t.done);
    else if (filter === 'done') out = out.filter((t) => t.done);
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((t) => t.label.toLowerCase().includes(q));
    return out;
  }, [tasks, filter, query]);

  const providerOptions = useMemo(() => providers.filter((p) => p.accounts.length > 0), [providers]);
  const selectedProvider = useMemo(
    () => providerOptions.find((p) => p.id === targetProviderId) ?? null,
    [providerOptions, targetProviderId]
  );
  const accountOptions = selectedProvider?.accounts ?? [];

  const hasValidTarget = Boolean(targetProviderId && targetAccountId);

  const showToast = () => setActionToast(true);

  const handleToggleTask = (providerId: string, accountId: string, taskId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    const account = provider?.accounts.find((a) => a.id === accountId);
    if (!account) return;

    const updated = (account.checklist ?? []).map((item) =>
      item.id === taskId ? { ...item, done: !item.done } : item
    );
    onAccountMetaChange(providerId, accountId, { checklist: updated });
    showToast();
  };

  const handleAddTask = () => {
    const trimmed = taskText.trim();
    if (!trimmed || !hasValidTarget) return;

    const provider = providers.find((p) => p.id === targetProviderId);
    const account = provider?.accounts.find((a) => a.id === targetAccountId);
    if (!account) return;

    const updated = [
      ...(account.checklist ?? []),
      { id: `${account.id}-task-${Date.now()}`, label: trimmed, done: false },
    ];
    onAccountMetaChange(targetProviderId, targetAccountId, { checklist: updated });
    setTaskText('');
    showToast();
  };

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTargetProviderId(e.target.value);
    setTargetAccountId('');
  };

  const handleAccountChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTargetAccountId(e.target.value);
  };

  const handleTaskInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    // Enter agrega la tarea (sin depender de clic), pero si está deshabilitado no hace nada.
    if (!taskText.trim() || !hasValidTarget) return;
    e.preventDefault();
    handleAddTask();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="flex items-center justify-between gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-white/60">
        <span>Checklist financiero</span>
        <InfoIcon label="Tareas de todas las cuentas. Marca completadas o agrega nuevas eligiendo la cuenta destino." />
      </div>

      {tasks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
            {(['all', 'pending', 'done'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                className={`rounded-xl px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] transition ${
                  filter === mode
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                {mode === 'all' ? 'Todas' : mode === 'pending' ? 'Pendientes' : 'Completadas'}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-[100px] flex-1 rounded-2xl border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            aria-label="Buscar tareas"
          />
        </div>
      )}

      {actionToast && (
        <p className="mt-2 text-xs text-emerald-400" role="status">
          Actualizado
        </p>
      )}

      <div className="mt-3 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-white/50">
            Aún no tienes tareas. Elige una cuenta y agrega tu primera tarea.
          </p>
        ) : visibleTasks.length === 0 ? (
          <p className="text-sm text-white/50">
            No hay tareas que coincidan con el filtro o búsqueda.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleTasks.map((task) => (
              <label
                key={`${task.providerId}-${task.accountId}-${task.id}`}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleTask(task.providerId, task.accountId, task.id)}
                  className="h-4 w-4 rounded border-white/40 text-emerald-400 focus:ring-2 focus:ring-emerald-400"
                />
                <span className={task.done ? 'line-through text-white/40' : 'text-white'}>{task.label}</span>
                <span className="ml-auto shrink-0 text-[0.65rem] text-white/40">
                  {task.providerName} · {task.accountName}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {providerOptions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            value={targetProviderId}
            onChange={handleProviderChange}
            className={financialInputBase}
            aria-label="Proveedor para nueva tarea"
          >
            <option value="">Proveedor</option>
            {providerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={targetAccountId}
            onChange={handleAccountChange}
            disabled={!selectedProvider}
            className={`${financialInputBase} disabled:opacity-50`}
            aria-label="Cuenta para nueva tarea"
          >
            <option value="">Cuenta</option>
            {accountOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nueva tarea"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyDown={handleTaskInputKeyDown}
            className={`min-w-[140px] flex-1 ${financialInputBase} placeholder-white/50`}
          />

          <button
            type="button"
            onClick={handleAddTask}
            disabled={!taskText.trim() || !hasValidTarget}
            className="rounded-2xl border border-emerald-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-300 disabled:border-white/10 disabled:text-white/40"
          >
            Agregar
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialChecklist;

