/**
 * LÓGICA DE CONVERSIÓN PURA
 * Este archivo contiene las funciones que realizan la conversión de números.
 * Es agnóstico al framework web (no usa Express) y es ideal para pruebas unitarias.
 * * Exporta: romanToArabic y arabicToRoman.
 */

// Mapeo de valores romanos
const ROMAN_MAP = {
  M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V : 5, IV: 4, I: 1
};

// Exportar las funciones para que otros módulos las puedan usar
module.exports = {
    romanToArabic,
    arabicToRoman
};