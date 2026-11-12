import { useState } from 'react';

export default function ExpenseForm({ categories, onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = title.trim();
    const value = Number(amount.replace(',', '.'));

    if (!name) {
      setError('Введите название расхода.');
      return;
    }
    if (amount.trim() === '' || Number.isNaN(value) || value <= 0) {
      setError('Сумма должна быть числом больше нуля.');
      return;
    }

    onAdd({ title: name, amount: value, category });
    setTitle('');
    setAmount('');
    setError('');
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Название</span>
        <input
          type="text"
          value={title}
          placeholder="Например, обед в столовой"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Сумма, ₸</span>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          placeholder="1500"
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Категория</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn">
        Добавить расход
      </button>
      {error && (
        <p className="message message--error form__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
