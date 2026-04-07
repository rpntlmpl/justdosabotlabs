import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Резкий взлет
    { duration: '20s', target: 100 }, // Экстремальная нагрузка
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:8080');
  check(res, { 'status is 200': (r) => r.status === 200 });
}