import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 }, // Разгон до 10 пользователей
    { duration: '30s', target: 10 }, // Удержание нагрузки
    { duration: '10s', target: 0 },  // Снижение нагрузки
  ],
};

export default function () {
  const res = http.get('http://localhost:8080');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}