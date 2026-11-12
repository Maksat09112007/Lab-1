import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Page from '../components/Page.jsx';
import LessonRating from '../components/LessonRating.jsx';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page
      kicker="· Задание 5 "
      title="Оценка занятия"
      lead="Компонент Rating получает максимальный балл через props, пользователь выбирает оценку."
    >
      <div className="grid-2">
        <LessonRating lesson="Основы React: компоненты" maxScore={5} />
        <LessonRating lesson="Практикум по JavaScript" maxScore={10} />
      </div>
    </Page>
  </StrictMode>
);
