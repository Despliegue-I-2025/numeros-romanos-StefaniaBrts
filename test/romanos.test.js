const { app, romanToArabic, arabicToRoman } = require('../romanos'); 
const request = require('supertest'); 

// Bloque de pruebas para la lógica de conversión (Tests Unitarios)
// Demuestra que las funciones unitarias cumplen con el happy path y límites.
describe('Conversion Functions - Lógica', () => {

    // --- ARABIC TO ROMAN (A2R) ---
    describe('arabicToRoman - Tests Positivos (Comportamiento Esperado)', () => {
        // Test Positivo Básico: Mínimo valor
        test('Debe convertir 1 a I', () => {
            expect(arabicToRoman(1)).toBe('I');
        });

        // Test Positivo Resta: Un caso con la regla de resta (90)
        test('Debe convertir casos de resta (90)', () => {
            expect(arabicToRoman(90)).toBe('XC');
        });

        // Test Positivo Complejo: Un caso complejo como un año (1994)
        test('Debe convertir un numero complejo como 1994 a MCMXCIV', () => {
            expect(arabicToRoman(1994)).toBe('MCMXCIV');
        });
        
        // Test Positivo Límite Superior: Valor máximo permitido (3999)
        test('Debe convertir el valor maximo 3999 a MMMCMXCIX', () => {
            expect(arabicToRoman(3999)).toBe('MMMCMXCIX');
        });
    });
    
    describe('arabicToRoman - Tests Negativos (Manejo de Limites y Errores)', () => {
        // Test Negativo: Valor fuera de rango (0)
        test('Debe retornar null si el numero es 0 (fuera de rango)', () => {
            expect(arabicToRoman(0)).toBe(null);
        });

        // Test Negativo: Valor fuera de rango (> 3999)
        test('Debe retornar null si el numero excede el limite de 3999', () => {
            expect(arabicToRoman(4000)).toBe(null);
        });

        // Test Negativo: Valores decimales
        test('Debe retornar null si el numero es decimal', () => {
            expect(arabicToRoman(10.5)).toBe(null);
        });
    });
    
    // --- ROMAN TO ARABIC (R2A) ---
    describe('romanToArabic - Tests Positivos (Comportamiento Esperado)', () => {
        // Test Positivo Básico
        test('Debe convertir el basico X a 10', () => {
            expect(romanToArabic('X')).toBe(10);
        });

        // Test Positivo Complejo
        test('Debe convertir MCMXCIV (1994) correctamente', () => {
            expect(romanToArabic('MCMXCIV')).toBe(1994);
        });
    });

    describe('romanToArabic - Tests Negativos (Manejo de Errores y Limites)', () => {
        // Test Negativo: Repeticion invalida de 4 veces (IIII)
        test('Debe retornar null si hay repeticion invalida de 4 veces (IIII)', () => {
            expect(romanToArabic('IIII')).toBe(null);
        });

        // Test Negativo: Caracteres no romanos
        test('Debe retornar null si contiene caracteres no romanos (AX)', () => {
            expect(romanToArabic('AX')).toBe(null);
        });

        // Test Negativo: Caso de resta invalida (IC)
        test('Debe retornar null por caso de resta invalida', () => {
            expect(romanToArabic('IC')).toBe(null);
        });

        // Test Negativo: Numero romano que excede 3999 (MMMM)
        test('Debe retornar null si el valor excede 3999 (MMMM)', () => {
             expect(romanToArabic('MMMM')).toBe(null);
        });
    });
});

// Bloque de pruebas para la API (Tests de Integración)
// Demuestra que la capa de Express maneja correctamente las peticiones y errores HTTP.
describe('API Endpoints - Integración', () => {
    
    // --- API: ARABIC TO ROMAN (/a2r) ---
    describe('GET /a2r', () => {
        // Test Positivo (HTTP 200)
        test('Debe retornar 200 y el romano correcto para 2024', async () => {
            const response = await request(app).get('/a2r?arabic=2024');
            expect(response.statusCode).toBe(200);
            expect(response.body.roman).toBe('MMXXIV');
        });

        // Test Negativo (HTTP 400): Fuera de rango
        test('Debe retornar 400 para un numero fuera de rango (> 3999)', async () => {
            const response = await request(app).get('/a2r?arabic=4000');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('inválido'); // CORREGIDO: Espera la palabra con la tilde 'á'
        });
    });

    // --- API: ROMAN TO ARABIC (/r2a) ---
    describe('GET /r2a', () => {
        // Test Positivo (HTTP 200)
        test('Debe retornar 200 y el arabigo correcto para MCM', async () => {
            const response = await request(app).get('/r2a?roman=MCM');
            expect(response.statusCode).toBe(200);
            expect(response.body.arabic).toBe(1900);
        });

        // Test Negativo (HTTP 400): Romano inválido
        test('Debe retornar 400 para un numero romano invalido (VL)', async () => {
            const response = await request(app).get('/r2a?roman=VL');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('inválido'); // CORREGIDO: Espera la palabra con la tilde 'á'
        });
    });

    // Tests de Integración Negativos para parámetros faltantes (aplicable a ambos endpoints)
    describe('Parametros Faltantes', () => {
        test('Debe retornar 400 para /a2r si falta el parametro arabic', async () => {
            const response = await request(app).get('/a2r');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('requerido');
        });

        test('Debe retornar 400 para /r2a si falta el parametro roman', async () => {
            const response = await request(app).get('/r2a');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('requerido');
        });
    });
});