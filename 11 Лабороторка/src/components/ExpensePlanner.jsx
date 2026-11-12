import { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm.jsx';
import ExpenseList, { formatMoney } from './ExpenseList.jsx';

export const CATEGORIES = ['Питание', 'Транспорт', 'Учёба', 'Развлечения', 'Другое'];
const STORAGE_KEY = 'lab11-expenses';
const ALL = 'Все категории';

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ExpensePlanner() {
  const [expenses, setExpenses] = useState(loadExpenses);
  const [filter, setFilter] = useState(ALL);
  const [actions, setActions] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  const handleAdd = (data) => {
    setExpenses((prev) => [{ id: Date.now() + Math.random(), ...data }, ...prev]);
    setActions((n) => n + 1);
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    setActions((n) => n + 1);
  };

  const handleClear = () => {
    setExpenses([]);
    setActions((n) => n + 1);
  };

  const handleFilter = (value) => {
    setFilter(value);
    setActions((n) => n + 1);
  };

  const visible = filter === ALL ? expenses : expenses.filter((e) => e.category === filter);
  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVisible = visible.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="planner">
      <section className="card">
        <p className="card__label">Новый расход</p>
        <h2>Планировщик расходов</h2>
        <ExpenseForm categories={CATEGORIES} onAdd={handleAdd} />
      </section>

      <section className="card">
        <div className="stats">
          <div className="stat">
            <p className="stat__label">Всего расходов</p>
            <p className="stat__value" data-testid="total-all">
              {formatMoney(totalAll)}
            </p>
          </div>
          <div className="stat">
            <p className="stat__label">По фильтру</p>
            <p className="stat__value" data-testid="total-visible">
              {formatMoney(totalVisible)}
            </p>
          </div>
          <div className="stat">
            <p className="stat__label">Действий выполнено</p>
            <p className="stat__value" data-testid="actions">
              {actions}
            </p>
          </div>
        </div>

        <div className="toolbar">
          <label className="field field--inline">
            <span>Фильтр</span>
            <select value={filter} onChange={(e) => handleFilter(e.target.value)}>
              <option value={ALL}>{ALL}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={handleClear}
            disabled={expenses.length === 0}
          >
            Очистить всё
          </button>
        </div>

        <ExpenseList expenses={visible} onDelete={handleDelete} />
      </section>
    </div>
  );
}
