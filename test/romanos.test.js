const request = require('supertest');

// IMPORTANTE: Se utiliza '../romanos' porque se asume que este archivo de prueba
// está dentro de una carpeta 'test/' y necesita ir un nivel arriba para encontrar 'romanos.js'.
const { 
    app, 
    romanToArabic, 
    arabicToRoman,
} = require('../romanos'); 

// =========================================================================
// BLOQUE 1: Pruebas Unitarias de Lógica de Conversión
// Estos tests aseguran que las funciones internas funcionan correctamente.
// =========================================================================
describe('Conversion Functions - Lógica Unitaria', () => {

    // --- ARABIC TO ROMAN (A2R) ---
    describe('arabicToRoman - Conversión de Arábigos a Romanos', () => {
        
        // Tests Positivos: Casos de éxito y límites
        test('Debe convertir 1 a I', () => {
            expect(arabicToRoman(1)).toBe('I');
        });
        test('Debe convertir el valor maximo 3999 a MMMCMXCIX', () => {
            expect(arabicToRoman(3999)).toBe('MMMCMXCIX');
        });
        test('Debe convertir un caso de resta (4) a IV', () => {
            expect(arabicToRoman(4)).toBe('IV');
        });
        test('Debe convertir un caso complejo (1994) a MCMXCIV', () => {
            expect(arabicToRoman(1994)).toBe('MCMXCIV');
        });

        // Tests Negativos: Valores inválidos o fuera de rango
        test('Debe retornar null para 0', () => {
            expect(arabicToRoman(0)).toBeNull();
        });
        test('Debe retornar null para 4000 (fuera de rango)', () => {
            expect(arabicToRoman(4000)).toBeNull();
        });
        test('Debe retornar null para numeros decimales (1.5)', () => {
            expect(arabicToRoman(1.5)).toBeNull();
        });
        test('Debe retornar null para NaN (ej: string que no es numero)', () => {
            expect(arabicToRoman(NaN)).toBeNull();
        });
    });

    // --- ROMAN TO ARABIC (R2A) ---
    describe('romanToArabic - Conversión de Romanos a Arábigos', () => {

        // Tests Positivos: Casos de éxito y límites
        test('Debe convertir I a 1', () => {
            expect(romanToArabic('I')).toBe(1);
        });
        test('Debe convertir el valor maximo MMMCMXCIX a 3999', () => {
            expect(romanToArabic('MMMCMXCIX')).toBe(3999);
        });
        test('Debe convertir un caso de resta (XL) a 40', () => {
            expect(romanToArabic('XL')).toBe(40);
        });
        test('Debe convertir un caso complejo (MCMXCIV) a 1994', () => {
            expect(romanToArabic('MCMXCIV')).toBe(1994);
        });
        test('Debe manejar minusculas (mcmxciv) y convertirlo a 1994', () => {
            // romanToArabic debe normalizar a mayúsculas internamente
            expect(romanToArabic('mcmxciv')).toBe(1994); 
        });

        // Tests Negativos: Romanos inválidos
        test('Debe retornar null para un string vacío', () => {
            expect(romanToArabic('')).toBeNull();
        });
        test('Debe retornar null para un romano inválido (IIII)', () => {
            expect(romanToArabic('IIII')).toBeNull();
        });
        test('Debe retornar null para un romano fuera de rango/malformado (VX)', () => {
            expect(romanToArabic('VX')).toBeNull(); 
        });
        test('Debe retornar null para un romano que contenga caracteres no válidos (A)', () => {
            expect(romanToArabic('IA')).toBeNull();
        });
    });
});


// =========================================================================
// BLOQUE 2: Pruebas de Integración de Endpoints Express (API)
// Estos tests aseguran que la API responde con los códigos de estado correctos.
// =========================================================================
describe('API Endpoints - Integración', () => {

    // --- ENDPOINT: /a2r (Arábigos a Romanos) ---
    describe('GET /a2r', () => {
        // Test Positivo (HTTP 200): Conversión exitosa
        test('Debe retornar 200 y el resultado romano para el numero 1994', async () => {
            const response = await request(app).get('/a2r?arabic=1994');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ roman: 'MCMXCIV' });
        });

        // Test Negativo (HTTP 400): Número fuera de rango (ej: 4000)
        test('Debe retornar 400 para un numero fuera de rango (4000)', async () => {
            const response = await request(app).get('/a2r?arabic=4000');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('fuera del rango'); 
        });

        // Test Negativo (HTTP 400): Número decimal
        test('Debe retornar 400 para un numero decimal (1.5)', async () => {
            const response = await request(app).get('/a2r?arabic=1.5');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('debe ser un entero'); 
        });

        // Test Negativo (HTTP 400): Parámetro faltante
        test('Debe retornar 400 si falta el parametro arabic', async () => {
            const response = await request(app).get('/a2r');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('requerido');
        });
    });

    // --- ENDPOINT: /r2a (Romanos a Arábigos) ---
    describe('GET /r2a', () => {
        // Test Positivo (HTTP 200): Conversión exitosa
        test('Debe retornar 200 y el resultado arabigo para el romano MCMXCIV', async () => {
            const response = await request(app).get('/r2a?roman=MCMXCIV');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ arabic: 1994 });
        });

        // Test Positivo (HTTP 200): Manejo de minúsculas
        test('Debe retornar 200 y el resultado arabigo para el romano en minusculas (mcmxciv)', async () => {
            const response = await request(app).get('/r2a?roman=mcmxciv');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ arabic: 1994 });
        });
        
        // Test Negativo (HTTP 400): Romano inválido (ej: IIII)
        test('Debe retornar 400 para un romano inválido (IIII)', async () => {
            const response = await request(app).get('/r2a?roman=IIII');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('inválido'); 
        });

        // Test Negativo (HTTP 400): Romano fuera de rango/malformado (ej: VX)
        test('Debe retornar 400 para un romano fuera de rango/malformado (VX)', async () => {
            const response = await request(app).get('/r2a?roman=VX');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('inválido'); 
        });

        // Test Negativo (HTTP 400): Parámetro faltante
        test('Debe retornar 400 si falta el parametro roman', async () => {
            const response = await request(app).get('/r2a');
            expect(response.statusCode).toBe(400);
            expect(response.body.detail).toContain('requerido');
        });
    });
});