import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonRating from '../components/LessonRating.jsx';

describe('Задание 5 — Оценка занятия (LessonRating)', () => {
  it('Т5.1 Начальное состояние: оценка не выбрана, кнопок столько, сколько maxScore', () => {
    render(<LessonRating lesson="Занятие" maxScore={5} />);
    expect(screen.getByTestId('rating-result')).toHaveTextContent('Оценка не выбрана');
    expect(screen.getAllByRole('button', { name: /^Оценка \d+$/ })).toHaveLength(5);
  });

  it('Т5.2 Основное действие: клик по «4» устанавливает оценку 4 из 5 (80%)', async () => {
    const user = userEvent.setup();
    render(<LessonRating lesson="Занятие" maxScore={5} />);
    await user.click(screen.getByRole('button', { name: 'Оценка 4' }));
    expect(screen.getByTestId('rating-result')).toHaveTextContent('Ваша оценка: 4 из 5 (80%)');
  });

  it('Т5.3 Повторное действие: новый выбор заменяет прежнюю оценку', async () => {
    const user = userEvent.setup();
    render(<LessonRating lesson="Занятие" maxScore={5} />);
    await user.click(screen.getByRole('button', { name: 'Оценка 2' }));
    await user.click(screen.getByRole('button', { name: 'Оценка 5' }));
    expect(screen.getByTestId('rating-result')).toHaveTextContent('5 из 5 (100%)');
    expect(screen.getByRole('button', { name: 'Оценка 2' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('Т5.4 Сброс: кнопка «Сбросить оценку» возвращает начальное состояние', async () => {
    const user = userEvent.setup();
    render(<LessonRating lesson="Занятие" maxScore={5} />);
    const reset = screen.getByRole('button', { name: 'Сбросить оценку' });
    expect(reset).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Оценка 3' }));
    expect(reset).toBeEnabled();
    await user.click(reset);
    expect(screen.getByTestId('rating-result')).toHaveTextContent('Оценка не выбрана');
  });

  it('Т5.5 Граничный ввод: maxScore = 0 показывает сообщение об ошибке', () => {
    render(<LessonRating lesson="Занятие" maxScore={0} />);
    expect(screen.getByText(/Некорректный максимальный балл/)).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /^Оценка/ })).toHaveLength(0);
  });

  it('Т5.6 Props: заголовок и шкала берутся из props родителя', () => {
    render(<LessonRating lesson="Практикум по JS" maxScore={10} />);
    expect(screen.getByRole('heading', { name: 'Практикум по JS' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Оценка \d+$/ })).toHaveLength(10);
  });

  it('Т5.7 Независимость: два экземпляра хранят свои состояния отдельно', async () => {
    const user = userEvent.setup();
    render(
      <>
        <LessonRating lesson="Первое" maxScore={5} />
        <LessonRating lesson="Второе" maxScore={10} />
      </>
    );
    const first = screen.getAllByRole('group')[0];
    await user.click(first.querySelector('button[aria-label="Оценка 3"]'));
    const results = screen.getAllByTestId('rating-result');
    expect(results[0]).toHaveTextContent('3 из 5');
    expect(results[1]).toHaveTextContent('Оценка не выбрана');
  });
});
