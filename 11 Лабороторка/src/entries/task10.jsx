import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Page from '../components/Page.jsx';
import Poll from '../components/Poll.jsx';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page
      kicker="  Задание 10 "
      title="Опрос"
      lead="Question получает вопрос и варианты через props; state хранит выбранный ответ и итоговый результат."
    >
      <Poll />
    </Page>
  </StrictMode>
);
