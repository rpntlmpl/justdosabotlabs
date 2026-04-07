import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    // Общие пороги успеха для всех тестов
    thresholds: {
        http_req_failed: ['rate<0.01'], // Ошибок должно быть меньше 1%
        http_req_duration: ['p(95)<250'], // 95% запросов должны быть быстрее 250мс
    },
    scenarios: {
        // СЦЕНАРИЙ 1: Smoke Test (Проверка доступности)
        // 1 пользователь в течение 15 секунд
        smoke_test: {
            executor: 'constant-vus',
            vus: 1,
            duration: '15s',
            exec: 'runTest', // Какую функцию запускать
        },

        // СЦЕНАРИЙ 2: Load Test (Обычная нагрузка)
        // Имитируем плавный приход 10 пользователей
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 10 }, // Разгон
                { duration: '30s', target: 10 }, // Стабильная работа
                { duration: '10s', target: 0 },  // Завершение
            ],
            startTime: '20s', // Запуск после Smoke теста
            exec: 'runTest',
        },

        // СЦЕНАРИЙ 3: Stress Test (Предельная нагрузка)
        // Проверяем, выдержит ли сайт резкий скачок до 50 пользователей
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 50 }, // Резкий взлет
                { duration: '20s', target: 50 }, // Удержание
                { duration: '10s', target: 0 },  // Спад
            ],
            startTime: '80s', // Запуск после Load теста
            exec: 'runTest',
        },
    },
};

// Общая логика теста для всех сценариев
export function runTest() {
    const res = http.get('http://localhost:8080');

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page contains welcome text': (r) => r.body.includes('index'), // Проверка контента (замените на текст из вашего html)
    });

    sleep(1);
}

// Default функция (нужна для k6, просто вызывает наш тест)
export default function () {
    runTest();
}