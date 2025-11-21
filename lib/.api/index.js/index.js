const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 4000;

// =========================================================================
// 1. IMPORTACIÓN DE LA LÓGICA DE CONVERSIÓN
// CRÍTICO: Importar las funciones puras desde el archivo de lógica separada en 'lib/conversion.js'.
// =========================================================================
const { romanToArabic, arabicToRoman } = require('../lib/conversion'); 

// Configuración de Express para manejar JSON
app.use(express.json());

// =========================================================================
// 2. MIDDLEWARE
// =========================================================================

// Usar el middleware CORS para permitir peticiones desde cualquier origen ('*')
app.use(cors());

// =========================================================================
// 3. MANEJADORES DE ERRORES ESTANDARIZADOS (RFC 7807)
// =========================================================================

/**
 * Responde con un error 400 para parámetros faltantes.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {string} paramName - Nombre del parámetro faltante.
 */
function handleMissingParam(res, paramName) {
    return res.status(400).json({
        type: "https://httpstatuses.com/400",
        title: "Bad Request",
        detail: `El parámetro '${paramName}' es requerido.`,
        status: 400
    });
}

/**
 * Responde con un error 400 para errores de conversión (entrada inválida o fuera de rango).
 * @param {object} res - Objeto de respuesta de Express.
 * @param {string} type - Tipo de número ('roman' o 'arabic').
 * @param {string} value - Valor que causó el error.
 */
function handleConversionError(res, type, value) {
    const errorType = (type === 'roman') ? 'Romano' : 'Arábigo';
    return res.status(400).json({
        type: "https://httpstatuses.com/400",
        title: "Bad Request",
        detail: `El número ${errorType} proporcionado ('${value}') es inválido o está fuera del rango [1-3999].`,
        status: 400
    });
}


// =========================================================================
// 4. ENDPOINTS
// =========================================================================

// Endpoint: Romanos a Arabigos (r2a)
// Ruta: /api/r2a?roman=X
app.get('/r2a', (req, res) => {
  const romanNumeral = req.query.roman;
  
  // Manejo de parámetro faltante/vacío
  if (romanNumeral === undefined || romanNumeral === '') {
    return handleMissingParam(res, 'roman');
  }

  // Llamada a la lógica pura
  const arabicNumber = romanToArabic(romanNumeral);
  
  // Manejo de error de conversión (la lógica devolvió null)
  if (arabicNumber === null) {
    return handleConversionError(res, 'roman', romanNumeral);
  }

  // Respuesta exitosa
  return res.json({ arabic: arabicNumber });
});

// Endpoint: Arabigos a Romanos (a2r)
// Ruta: /api/a2r?arabic=X
app.get('/a2r', (req, res) => {
  const arabicValue = req.query.arabic;
  
  // Manejo de parámetro faltante/vacío
  if (arabicValue === undefined || arabicValue === '') {
    return handleMissingParam(res, 'arabic');
  }

  // Llamada a la lógica pura
  const arabicNumber = parseInt(arabicValue, 10);
  const romanNumeral = arabicToRoman(arabicNumber);
  
  // Manejo de error de conversión (rango, decimales, NaN)
  if (romanNumeral === null) {
    return handleConversionError(res, 'arabic', arabicValue);
  }

  // Respuesta exitosa
  return res.json({ roman: romanNumeral });
});

// =========================================================================
// 5. INICIALIZACIÓN Y EXPORTACIÓN
// =========================================================================

// Inicialización del servidor si se ejecuta directamente (para desarrollo local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

// Exportamos la instancia de la aplicación, esencial para Vercel Serverless
// Vercel usará esta exportación para crear la función Serverless.
module.exports = app;

// Exportamos las funciones de apoyo para el archivo de pruebas 'romanos.test.js'
module.exports.handleConversionError = handleConversionError;
module.exports.handleMissingParam = handleMissingParam;
module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;