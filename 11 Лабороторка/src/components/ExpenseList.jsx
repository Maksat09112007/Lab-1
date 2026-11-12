export function formatMoney(value) {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₸`;
}

export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return <p className="empty">Расходов пока нет. Добавьте первый.</p>;
  }

  return (
    <ul className="expenses">
      {expenses.map((item) => (
        <li key={item.id} className="expense">
          <div>
            <p className="expense__title">{item.title}</p>
            <p className="expense__cat">{item.category}</p>
          </div>
          <p className="expense__sum">{formatMoney(item.amount)}</p>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            aria-label={`Удалить расход ${item.title}`}
            onClick={() => onDelete(item.id)}
          >
            Удалить
          </button>
        </li>
      ))}
    </ul>
  );
}
