const { app, romanToArabic, arabicToRoman } = require('../romanos'); 
const request = require('supertest'); 
const { 
    handleConversionError, 
    handleMissingParam 
} = require('../romanos'); // Se asume que estos se exportan en romanos.js

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

    describe('arabicToRoman - Tests Negativos (Comportamiento No Esperado)', () => {
        // Test Negativo Límite Inferior (0)
        test('Debe retornar null para 0 (limite inferior)', () => {
            expect(arabicToRoman(0)).toBeNull();
        });

        // Test Negativo Límite Superior (4000)
        test('Debe retornar null para 4000 (limite superior)', () => {
            expect(arabicToRoman(4000)).toBeNull();
        });

        // Test Negativo Tipo de Dato (string)
        test('Debe retornar null para un string no numerico', () => {
            expect(arabicToRoman('hola')).toBeNull();
        });

        // Test Negativo Tipo de Dato (decimal)
        test('Debe retornar null para un numero decimal', () => {
            expect(arabicToRoman(1.5)).toBeNull();
        });
    });
    
    // --- ROMAN TO ARABIC (R2A) ---
    describe('romanToArabic - Tests Positivos (Comportamiento Esperado)', () => {
        // Test Positivo Básico: Mínimo valor
        test('Debe convertir I a 1', () => {
            expect(romanToArabic('I')).toBe(1);
        });
        
        // Test Positivo Resta: Un caso con la regla de resta (90)
        test('Debe convertir casos de resta (XC)', () => {
            expect(romanToArabic('XC')).toBe(90);
        });

        // Test Positivo Complejo: Un caso complejo como un año (1994)
        test('Debe convertir un numero complejo como MCMXCIV a 1994', () => {
            expect(romanToArabic('MCMXCIV')).toBe(1994);
        });

        // Test Positivo Límite Superior: Valor máximo permitido (3999)
        test('Debe convertir el valor maximo MMMCMXCIX a 3999', () => {
            expect(romanToArabic('MMMCMXCIX')).toBe(3999);
        });
        
        // Test Positivo con Minúsculas (tolerancia)
        test('Debe manejar minusculas como mcxciv', () => {
            expect(romanToArabic('mcMXC iv')).toBe(1994);
        });
    });

    describe('romanToArabic - Tests Negativos (Comportamiento No Esperado)', () => {
        // Test Negativo: Repetición de más de 3 veces (IIII)
        test('Debe retornar null para repeticion invalida (IIII)', () => {
            expect(romanToArabic('IIII')).toBeNull();
        });
        
        // Test Negativo: Resta inválida (IC)
        test('Debe retornar null para resta invalida (IC)', () => {
            expect(romanToArabic('IC')).toBeNull();
        });
        
        // Test Negativo: Formato inválido (VL)
        test('Debe retornar null para formato inválido (VL)', () => {
            expect(romanToArabic('VL')).toBeNull();
        });

        // Test Negativo: Vacio
        test('Debe retornar null para un string vacio', () => {
            expect(romanToArabic('')).toBeNull();
        });
        
        // Test Negativo: Null
        test('Debe retornar null para null', () => {
            expect(romanToArabic(null)).toBeNull();
        });
    });
});


// Bloque de pruebas para la API REST (Tests de Integración)
describe('API Endpoints - Conversión Pública (GET /r2a, /a2r)', () => {
    
    // --- API: ARABIC TO ROMAN (/a2r) ---
    describe('GET /a2r', () => {
        // Test Positivo (HTTP 200)
        test('Debe retornar 200 y el romano correcto para 1994', async () => {
            const response = await request(app).get('/a2r?arabic=1994');
            expect(response.statusCode).toBe(200);
            expect(response.body.roman).toBe('MCMXCIV');
        });

        // Test Negativo (HTTP 400): Número arábigo fuera de rango
        test('Debe retornar 400 para un numero arabigo fuera de rango (4000)', async () => {
            const response = await request(app).get('/a2r?arabic=4000');
            expect(response.statusCode).toBe(400);
            // Usando 'detail' porque la respuesta 400 usa el formato RFC 7807 (JSON con 'detail')
            expect(response.body.detail).toContain('fuera del rango permitido'); 
        });

        // Test Negativo (HTTP 400): Dato no numérico
        test('Debe retornar 400 para un numero arabigo no numerico (hola)', async () => {
            const response = await request(app).get('/a2r?arabic=hola');
            expect(response.statusCode).toBe(400);
            // Usando 'detail' porque la respuesta 400 usa el formato RFC 7807 (JSON con 'detail')
            expect(response.body.detail).toContain('fuera del rango permitido'); 
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
            // Usando 'detail' porque la respuesta 400 usa el formato RFC 7807 (JSON con 'detail')
            expect(response.body.detail).toContain('inválido'); 
        });
        
        // Test Negativo (HTTP 400): Romano fuera de rango (ej: IVI)
        test('Debe retornar 400 para un romano fuera de rango/malformado (IVI)', async () => {
            const response = await request(app).get('/r2a?roman=IVI');
            expect(response.statusCode).toBe(400);
            // Usando 'detail' porque la respuesta 400 usa el formato RFC 7807 (JSON con 'detail')
            expect(response.body.detail).toContain('inválido'); 
        });
    });

    // Tests de Integración Negativos para parámetros faltantes (aplicable a ambos endpoints)
    describe('Parametros Faltantes', () => {
        test('Debe retornar 400 para /a2r si falta el parametro arabic', async () => {
            const response = await request(app).get('/a2r');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('requerido');
        });

        test('Debe retornar 400 para /r2a si falta el parametro roman', async () => {
            const response = await request(app).get('/r2a');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('requerido');
        });
    });
});