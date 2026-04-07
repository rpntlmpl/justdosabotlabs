import http from 'k6/http';
import { sleep, check } from 'k6';

// 1. Конфигурация тестов (Options)
export const options = {
    thresholds: {
        http_req_failed: ['rate<0.01'], // Ошибка менее 1% запросов
        http_req_duration: ['p(95)<200'], // 95% запросов должны быть быстрее 200мс
    },
    scenarios: {
        // Сценарий 1: Smoke Test
        smoke_test: {
            executor: 'constant-vus',
            vus: 1,
            duration: '10s',
        },
        // Сценарий 2: Load Test (имитация 10 пользователей)
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 10 }, // Разгон до 10 пользователей
                { duration: '30s', target: 10 }, // Плато
                { duration: '10s', target: 0 },  // Снижение
            ],
            startTime: '10s',
        },
    },
};

// Функция самого теста
export default function () {
    // В CI/CD мы будем тестировать локальный адрес, где поднимется контейнер
    const res = http.get('http://localhost:8080');
    
    check(res, {
        'status is 200': (r) => r.status === 200,
        'protocol is HTTP/1.1': (r) => r.proto === 'HTTP/1.1',
    });
    
    sleep(1);
}

