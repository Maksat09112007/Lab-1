import { useState } from 'react';

function ScoreButton({ value, active, onSelect }) {
  return (
    <button
      type="button"
      className={active ? 'score score--active' : 'score'}
      aria-pressed={active}
      aria-label={`Оценка ${value}`}
      onClick={() => onSelect(value)}
    >
      {value}
    </button>
  );
}

export default function LessonRating({ lesson, maxScore }) {
  const [score, setScore] = useState(0);

  const max = Number.isInteger(maxScore) && maxScore > 0 ? maxScore : 0;
  if (max === 0) {
    return (
      <section className="card">
        <h2>{lesson}</h2>
        <p className="message message--error">
          Некорректный максимальный балл: оценка недоступна.
        </p>
      </section>
    );
  }

  const scores = Array.from({ length: max }, (_, i) => i + 1);
  const percent = Math.round((score / max) * 100);

  return (
    <section className="card">
      <p className="card__label">Занятие</p>
      <h2>{lesson}</h2>
      <p className="card__hint">Выберите оценку от 1 до {max}</p>

      <div className="scores" role="group" aria-label={`Шкала оценок до ${max}`}>
        {scores.map((value) => (
          <ScoreButton
            key={value}
            value={value}
            active={value === score}
            onSelect={setScore}
          />
        ))}
      </div>

      <div className="meter" aria-hidden="true">
        <div className="meter__fill" style={{ width: `${percent}%` }} />
      </div>

      <p className="result" data-testid="rating-result">
        {score === 0
          ? 'Оценка не выбрана'
          : `Ваша оценка: ${score} из ${max} (${percent}%)`}
      </p>

      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => setScore(0)}
        disabled={score === 0}
      >
        Сбросить оценку
      </button>
    </section>
  );
}
