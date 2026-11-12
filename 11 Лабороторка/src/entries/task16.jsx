import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Page from '../components/Page.jsx';
import ExpensePlanner from '../components/ExpensePlanner.jsx';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page
      kicker="Задание 16"
      title="Планировщик расходов"
      lead="ExpenseForm и ExpenseList; родитель хранит список расходов, общую сумму и фильтр категорий."
    >
      <ExpensePlanner />
    </Page>
  </StrictMode>
);
