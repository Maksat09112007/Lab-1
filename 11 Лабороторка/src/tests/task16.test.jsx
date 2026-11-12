import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpensePlanner from '../components/ExpensePlanner.jsx';

async function addExpense(user, title, amount, category) {
  await user.clear(screen.getByLabelText('Название'));
  await user.type(screen.getByLabelText('Название'), title);
  await user.clear(screen.getByLabelText('Сумма, ₸'));
  await user.type(screen.getByLabelText('Сумма, ₸'), amount);
  if (category) await user.selectOptions(screen.getByLabelText('Категория'), category);
  await user.click(screen.getByRole('button', { name: 'Добавить расход' }));
}

const money = (n) => new RegExp(`^${n.replace(/\s/g, '[\\s\\u00a0\\u202f]')} ₸$`);

describe('Задание 16 — Планировщик расходов (ExpenseForm, ExpenseList)', () => {
  it('Т16.1 Начальное состояние: список пуст, суммы 0 ₸', () => {
    render(<ExpensePlanner />);
    expect(screen.getByText(/Расходов пока нет/)).toBeInTheDocument();
    expect(screen.getByTestId('total-all')).toHaveTextContent('0 ₸');
    expect(screen.getByTestId('actions')).toHaveTextContent('0');
  });

  it('Т16.2 Основное действие: добавление расхода обновляет список и общую сумму', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await addExpense(user, 'Обед', '1500', 'Питание');
    expect(screen.getByText('Обед')).toBeInTheDocument();
    expect(screen.getByTestId('total-all').textContent).toMatch(money('1 500'));
    expect(screen.getByLabelText('Название')).toHaveValue('');
  });

  it('Т16.3 Повторное действие: второй расход суммируется с первым', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await addExpense(user, 'Обед', '1500', 'Питание');
    await addExpense(user, 'Автобус', '200', 'Транспорт');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByTestId('total-all').textContent).toMatch(money('1 700'));
  });

  it('Т16.4 Фильтр: выбор категории показывает только её расходы и сумму', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await addExpense(user, 'Обед', '1500', 'Питание');
    await addExpense(user, 'Автобус', '200', 'Транспорт');
    await user.selectOptions(screen.getByLabelText('Фильтр'), 'Транспорт');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByText('Автобус')).toBeInTheDocument();
    expect(screen.getByTestId('total-visible').textContent).toMatch(money('200'));
    expect(screen.getByTestId('total-all').textContent).toMatch(money('1 700'));
  });

  it('Т16.5 Удаление: кнопка «Удалить» убирает расход и пересчитывает сумму', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await addExpense(user, 'Обед', '1500', 'Питание');
    await user.click(screen.getByRole('button', { name: 'Удалить расход Обед' }));
    expect(screen.queryByText('Обед')).not.toBeInTheDocument();
    expect(screen.getByTestId('total-all')).toHaveTextContent('0 ₸');
  });

  it('Т16.6 Пустой ввод: без названия расход не добавляется, выводится сообщение', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await user.type(screen.getByLabelText('Сумма, ₸'), '500');
    await user.click(screen.getByRole('button', { name: 'Добавить расход' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Введите название расхода');
    expect(screen.getByText(/Расходов пока нет/)).toBeInTheDocument();
  });

  it('Т16.7 Некорректная сумма: отрицательное и нечисловое значения отклоняются', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await addExpense(user, 'Тест', '-100');
    expect(screen.getByRole('alert')).toHaveTextContent('Сумма должна быть числом больше нуля');
    await addExpense(user, 'Тест', 'abc');
    expect(screen.getByRole('alert')).toHaveTextContent('Сумма должна быть числом больше нуля');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('Т16.8 Творческое задание: данные сохраняются в localStorage и восстанавливаются', async () => {
    const user = userEvent.setup();
    const first = render(<ExpensePlanner />);
    await addExpense(user, 'Тетрадь', '300', 'Учёба');
    expect(JSON.parse(localStorage.getItem('lab11-expenses'))).toHaveLength(1);
    first.unmount();
    render(<ExpensePlanner />);
    expect(screen.getByText('Тетрадь')).toBeInTheDocument();
  });

  it('Т16.9 Творческое задание: счётчик действий растёт при добавлении и удалении', async () => {
    const user = userEvent.setup();
    render(<ExpensePlanner />);
    await addExpense(user, 'Кофе', '800', 'Питание');
    await user.click(screen.getByRole('button', { name: 'Удалить расход Кофе' }));
    expect(screen.getByTestId('actions')).toHaveTextContent('2');
  });
});
