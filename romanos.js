const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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

// Expresión regular para validar números romanos del 1 al 3999.
// Esta expresión asegura el orden correcto y las reglas de repetición/resta (ej: no permite IIII, IC, VL).
const ROMAN_REGEX = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

/**
 * Convierte un número romano (string) a su equivalente arábigo (number).
 * Devuelve null si el número romano es inválido o está fuera del rango [1-3999].
 * @param {string} roman - El número romano a convertir.
 * @returns {number|null} El número arábigo o null.
 */
function romanToArabic(roman) {
  if (typeof roman !== 'string' || !roman || !ROMAN_REGEX.test(roman.toUpperCase())) {
    return null;
  }
  
  const upperRoman = roman.toUpperCase();
  let arabic = 0;
  let i = 0;
  
  while (i < upperRoman.length) {
    // Intenta verificar pares de dos caracteres (para CM, XL, IV, etc.)
    const twoChars = upperRoman.substring(i, i + 2);
    if (ROMAN_MAP[twoChars]) {
      arabic += ROMAN_MAP[twoChars];
      i += 2;
    } else if (ROMAN_MAP[upperRoman[i]]) {
      // Si no es un par de resta, toma el valor de un solo caracter
      arabic += ROMAN_MAP[upperRoman[i]];
      i += 1;
    } else {
      // Esto solo debería ocurrir si el regex falla, pero es una protección
      return null; 
    }
  }

  // Comprueba que el valor final esté en el rango [1, 3999]
  if (arabic < 1 || arabic > 3999) {
    return null;
  }

  return arabic;
}


/**
 * Convierte un número arábigo (number) a su equivalente romano (string).
 * Devuelve null si el número arábigo es inválido o está fuera del rango [1-3999].
 * @param {number} arabic - El número arábigo a convertir.
 * @returns {string|null} El número romano o null.
 */
function arabicToRoman(arabic) {
  // Validación estricta: debe ser un entero y estar en el rango [1, 3999]
  if (typeof arabic !== 'number' || !Number.isInteger(arabic) || arabic < 1 || arabic > 3999) {
    return null;
  }

  let roman = '';
  let num = arabic;

  // Los keys de ROMAN_MAP están ordenados de mayor a menor, lo que permite la conversión Greedy
  for (const symbol in ROMAN_MAP) {
    const value = ROMAN_MAP[symbol];
    while (num >= value) {
      roman += symbol;
      num -= value;
    }
  }

  return roman;
}

// --- API ENDPOINTS (Express) ---

// Manejo de errores centralizado (usado para unificar respuestas 400 con tildes)
const handleConversionError = (res, type, value) => {
    let message;
    if (type === 'roman') {
        message = `Número romano inválido o fuera de rango (1-3999): "${value}".`;
    } else {
        message = `Número arábigo inválido o fuera de rango (1-3999): ${value}.`;
    }
    return res.status(400).json({ error: message });
};

// Romanos a Arabigos
app.get('/r2a', (req, res) => {
  const romanNumeral = req.query.roman;
  if (!romanNumeral) {
    return res.status(400).json({ error: 'Parámetro roman requerido.' });
  }

  const arabicNumber = romanToArabic(romanNumeral);
  if (arabicNumber === null) {
    return handleConversionError(res, 'roman', romanNumeral);
  }

  return res.json({ arabic: arabicNumber });
});

// Arabigos a Romanos
app.get('/a2r', (req, res) => {
  const arabicNumber = parseInt(req.query.arabic, 10);
  
  // Verifica si el parámetro está presente, incluso si es "0" o un string no numérico.
  // La validación estricta de rango y tipo ocurre dentro de arabicToRoman
  if (req.query.arabic === undefined || req.query.arabic === '') {
    return res.status(400).json({ error: 'Parámetro arabic requerido.' });
  }

  // Si parseInt devuelve NaN (ej: "hola"), la función lo maneja.
  // Si parseInt devuelve un número (ej: 4000), la función lo maneja.
  const romanNumeral = arabicToRoman(arabicNumber);
  
  if (romanNumeral === null) {
    return handleConversionError(res, 'arabic', req.query.arabic);
  }

  return res.json({ roman: romanNumeral });
});

// Inicialización del servidor si se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor conversor escuchando en el puerto ${PORT}`);
  });
}

// Exportar app y las funciones de conversión para Jest
module.exports = { app, romanToArabic, arabicToRoman };