import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'format',
    text: 'Какой формат занятий вам подходит больше всего?',
    options: ['Лекции', 'Практикумы', 'Проекты', 'Смешанный'],
  },
  {
    id: 'tool',
    text: 'Какой инструмент вы чаще используете при разработке?',
    options: ['VS Code', 'WebStorm', 'Браузер (DevTools)', 'Другое'],
  },
  {
    id: 'topic',
    text: 'Какая тема курса вам интереснее?',
    options: ['DOM и события', 'Fetch API', 'React', 'Модули'],
  },
];

function Question({ question, options, selected, onSelect, disabled }) {
  return (
    <fieldset className="question" disabled={disabled}>
      <legend>{question.text}</legend>
      <div className="options">
        {options.map((option) => (
          <label
            key={option}
            className={option === selected ? 'option option--selected' : 'option'}
          >
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={option === selected}
              onChange={() => onSelect(question.id, option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Poll() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [tally, setTally] = useState({});
  const [passes, setPasses] = useState(0);

  const answeredCount = Object.keys(answers).length;

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setError('');
  };

  const handleSubmit = () => {
    if (answeredCount < QUESTIONS.length) {
      setError(
        `Ответьте на все вопросы: осталось ${QUESTIONS.length - answeredCount}.`
      );
      return;
    }
    setTally((prev) => {
      const next = { ...prev };
      QUESTIONS.forEach((q) => {
        const key = `${q.id}::${answers[q.id]}`;
        next[key] = (next[key] || 0) + 1;
      });
      return next;
    });
    setPasses((n) => n + 1);
    setSubmitted(true);
  };

  const handleRestart = () => {
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  return (
    <section className="card card--wide">
      <p className="card__label">Опрос</p>
      <h2>Мнение студентов о курсе</h2>
      <p className="card__hint" data-testid="poll-progress">
        Отвечено: {answeredCount} из {QUESTIONS.length}
      </p>

      {QUESTIONS.map((q) => (
        <Question
          key={q.id}
          question={q}
          options={q.options}
          selected={answers[q.id]}
          onSelect={handleSelect}
          disabled={submitted}
        />
      ))}

      {error && (
        <p className="message message--error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        {!submitted ? (
          <button type="button" className="btn" onClick={handleSubmit}>
            Завершить опрос
          </button>
        ) : (
          <button type="button" className="btn" onClick={handleRestart}>
            Пройти заново
          </button>
        )}
      </div>

      {submitted && (
        <div className="summary" data-testid="poll-summary">
          <h3>Итоговый результат</h3>
          <p className="card__hint">Прохождений опроса: {passes}</p>
          {QUESTIONS.map((q) => (
            <div key={q.id} className="summary__block">
              <p className="summary__q">{q.text}</p>
              <p className="summary__a">
                Ваш ответ: <strong>{answers[q.id]}</strong>
              </p>
              <ul className="bars">
                {q.options.map((option) => {
                  const votes = tally[`${q.id}::${option}`] || 0;
                  const share = passes ? Math.round((votes / passes) * 100) : 0;
                  return (
                    <li key={option}>
                      <span className="bars__label">{option}</span>
                      <span className="bars__track">
                        <span className="bars__fill" style={{ width: `${share}%` }} />
                      </span>
                      <span className="bars__value">
                        {votes} ({share}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
