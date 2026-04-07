import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Додаткова метрика для підрахунку успішних запитів
const successCounter = new Counter('successful_requests');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // Тест провалено, якщо >1% помилок
    http_req_duration: ['p(95)<250'], // 95% запитів мають бути швидшими за 250мс
  },
  stages: [
    { duration: '30s', target: 10 }, // Тест 1: Smoke test (мале навантаження)
    { duration: '1m', target: 50 },  // Тест 2: Load test (середнє навантаження)
    { duration: '20s', target: 0 },  // Тест 3: Stress recovery (відновлення)
  ],
};

export default function () {
  const url = 'http://localhost:8080';

  // --- ТЕСТ 1: Доступність та статус-коди ---
  const res = http.get(url);
  const statusCheck = check(res, {
    '1. Status is 200': (r) => r.status === 200,
  });
  if (statusCheck) successCounter.add(1);

  // --- ТЕСТ 2: Перевірка контенту (чи завантажився саме наш сайт) ---
  check(res, {
    '2. Page has correct title': (r) => r.body.includes('<title>'), // Перевірка наявності тегу title
    '2. Content-Type is HTML': (r) => r.headers['Content-Type'].includes('text/html'),
  });

  // --- ТЕСТ 3: Швидкість відповіді (Performance) ---
  check(res, {
    '3. Response time < 150ms': (r) => r.timings.duration < 150,
    '3. TTFB (Time to First Byte) < 100ms': (r) => r.timings.waiting < 100,
  });

  sleep(1);
}

