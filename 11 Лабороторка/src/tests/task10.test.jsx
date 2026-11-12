import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Poll from '../components/Poll.jsx';

async function answerAll(user) {
  await user.click(screen.getByRole('radio', { name: 'Практикумы' }));
  await user.click(screen.getByRole('radio', { name: 'VS Code' }));
  await user.click(screen.getByRole('radio', { name: 'React' }));
}

describe('Задание 10 — Опрос (Poll, Question)', () => {
  it('Т10.1 Начальное состояние: ни один вариант не выбран, отвечено 0 из 3', () => {
    render(<Poll />);
    expect(screen.getByTestId('poll-progress')).toHaveTextContent('Отвечено: 0 из 3');
    screen.getAllByRole('radio').forEach((r) => expect(r).not.toBeChecked());
    expect(screen.queryByTestId('poll-summary')).not.toBeInTheDocument();
  });

  it('Т10.2 Основное действие: выбор варианта обновляет state и счётчик', async () => {
    const user = userEvent.setup();
    render(<Poll />);
    await user.click(screen.getByRole('radio', { name: 'Проекты' }));
    expect(screen.getByRole('radio', { name: 'Проекты' })).toBeChecked();
    expect(screen.getByTestId('poll-progress')).toHaveTextContent('Отвечено: 1 из 3');
  });

  it('Т10.3 Повторное действие: смена ответа не увеличивает счётчик', async () => {
    const user = userEvent.setup();
    render(<Poll />);
    await user.click(screen.getByRole('radio', { name: 'Лекции' }));
    await user.click(screen.getByRole('radio', { name: 'Смешанный' }));
    expect(screen.getByRole('radio', { name: 'Лекции' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Смешанный' })).toBeChecked();
    expect(screen.getByTestId('poll-progress')).toHaveTextContent('Отвечено: 1 из 3');
  });

  it('Т10.4 Некорректный ввод: завершение без ответов показывает ошибку', async () => {
    const user = userEvent.setup();
    render(<Poll />);
    await user.click(screen.getByRole('button', { name: 'Завершить опрос' }));
    expect(screen.getByRole('alert')).toHaveTextContent('осталось 3');
    expect(screen.queryByTestId('poll-summary')).not.toBeInTheDocument();
  });

  it('Т10.5 Итог: после всех ответов показывается результат с выбранными вариантами', async () => {
    const user = userEvent.setup();
    render(<Poll />);
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Завершить опрос' }));
    const summary = screen.getByTestId('poll-summary');
    expect(within(summary).getByText('Прохождений опроса: 1')).toBeInTheDocument();
    expect(within(summary).getAllByText('Практикумы').length).toBeGreaterThan(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('Т10.6 Сброс: «Пройти заново» очищает ответы, голоса накапливаются', async () => {
    const user = userEvent.setup();
    render(<Poll />);
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Завершить опрос' }));
    await user.click(screen.getByRole('button', { name: 'Пройти заново' }));
    expect(screen.getByTestId('poll-progress')).toHaveTextContent('Отвечено: 0 из 3');
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Завершить опрос' }));
    expect(screen.getByText('Прохождений опроса: 2')).toBeInTheDocument();
  });
});
