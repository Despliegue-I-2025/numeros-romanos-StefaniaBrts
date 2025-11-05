const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de Express para manejar JSON
app.use(express.json());

// =========================================================================
// LÓGICA DE CONVERSIÓN (AJUSTADA AL RANGO [1-3999])
// =========================================================================

// Definición de valores para la conversión
const ROMAN_MAP = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1
};

// Expresión regular para validar números romanos del 1 al 3999 (MMMCMXCIX).
const ROMAN_REGEX = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

/**
 * Convierte un número romano (string) a su equivalente arábigo (number).
 * Devuelve null si el número romano es inválido o está fuera del rango [1-3999].
 * @param {string} roman - El número romano a convertir.
 * @returns {number|null} El número arábigo o null.
 */
function romanToArabic(roman) {
  // 1. Limpieza y estandarización de la entrada (Elimina espacios y convierte a mayúsculas)
  const upperRoman = (typeof roman === 'string' ? roman.replace(/\s/g, '').toUpperCase() : '');

  // 2. Validación de tipo, existencia y formato (regex)
  if (!upperRoman || !ROMAN_REGEX.test(upperRoman)) {
    return null;
  }
  
  let total = 0;
  let i = 0;
  
  // 3. Iteración y suma basada en ROMAN_MAP
  for (const [romanStr, value] of Object.entries(ROMAN_MAP)) {
    while (upperRoman.substring(i).startsWith(romanStr)) {
      total += value;
      i += romanStr.length;
    }
  }

  // 4. Validación final: Asegura que todo el string fue procesado
  if (i !== upperRoman.length) {
      return null;
  }
  
  return total;
}

/**
 * Convierte un número arábigo (number) a su equivalente romano (string).
 * Devuelve null si el número arábigo no es un entero o está fuera del rango [1-3999].
 * @param {number} num - El número arábigo a convertir.
 * @returns {string|null} El número romano o null.
 */
function arabicToRoman(num) {
  num = Number(num);
  // Restricción de límite y tipo (debe ser un entero entre 1 y 3999)
  if (!Number.isInteger(num) || num < 1 || num > 3999) return null; 

  const pairs = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  
  let res = '';
  let tempNum = num; // Usamos una variable temporal para la conversión
  
  for (const [value, roman] of pairs) {
    while (tempNum >= value) {
      res += roman;
      tempNum -= value;
    }
  }
  return res;
}

// Exportamos las funciones de lógica para los tests unitarios
module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;

// =========================================================================
// MIDDLEWARES Y UTILIDADES (Manejo de errores estandarizado)
// =========================================================================

/**
 * Genera una respuesta de error 400 estandarizada (RFC 7807) para fallos de conversión.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {string} paramName - Nombre del parámetro que falló ('roman' o 'arabic').
 * @param {string} value - El valor de entrada inválido.
 * @returns {object} Respuesta JSON de Express.
 */
const handleConversionError = (res, paramName, value) => {
  return res.status(400).json({
    type: 'about:blank',
    title: 'Valor de conversión inválido',
    status: 400,
    detail: `El valor proporcionado en el parámetro '${paramName}' ('${value}') es inválido o está fuera del rango permitido [1-3999].`,
    instance: res.req.originalUrl
  });
};

/**
 * Genera una respuesta de error 400 estandarizada (RFC 7807) para parámetros faltantes.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {string} paramName - Nombre del parámetro faltante ('roman' o 'arabic').
 * @returns {object} Respuesta JSON de Express.
 */
const handleMissingParam = (res, paramName) => {
  return res.status(400).json({
    type: 'about:blank',
    title: 'Parámetro requerido faltante',
    status: 400,
    detail: `El parámetro de consulta '${paramName}' es requerido.`,
    instance: res.req.originalUrl
  });
};

// Exportamos los manejadores de error para que sean accesibles desde los tests de integración
module.exports.handleConversionError = handleConversionError;
module.exports.handleMissingParam = handleMissingParam;

// =========================================================================
// RUTAS DE CONVERSIÓN (PÚBLICAS)
// =========================================================================

// Endpoint: Romanos a Arabigos
app.get('/r2a', (req, res) => {
  const romanNumeral = req.query.roman;
  if (!romanNumeral) {
    // Usamos el manejador de error estandarizado
    return handleMissingParam(res, 'roman');
  }

  const arabicNumber = romanToArabic(romanNumeral);
  if (arabicNumber === null) {
    // Usamos el manejador de error estandarizado
    return handleConversionError(res, 'roman', romanNumeral);
  }

  return res.json({ arabic: arabicNumber });
});

// Endpoint: Arabigos a Romanos
app.get('/a2r', (req, res) => {
  const arabicNumber = parseInt(req.query.arabic, 10);
  
  // Verificación de parámetro faltante o vacío
  if (req.query.arabic === undefined || req.query.arabic === '') {
    // Usamos el manejador de error estandarizado
    return handleMissingParam(res, 'arabic');
  }

  const romanNumeral = arabicToRoman(arabicNumber);
  
  // Verificación de conversión fallida (rango, decimales, NaN)
  if (romanNumeral === null) {
    // Usamos el manejador de error estandarizado, pasando el valor original del query
    return handleConversionError(res, 'arabic', req.query.arabic);
  }

  return res.json({ roman: romanNumeral });
});

// =========================================================================
// INICIALIZACIÓN Y EXPORTACIÓN
// =========================================================================

// Inicialización del servidor si se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

// Exportamos la instancia de la aplicación para los tests
module.exports.app = app;