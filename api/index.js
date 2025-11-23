const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static("public"));
app.use(express.json());

// ===============================
// FUNCIONES DE CONVERSIÓN
// ===============================

const ROMAN_MAP = {
  M: 1000, CM: 900, D: 500, CD: 400,
  C: 100, XC: 90, L: 50, XL: 40,
  X: 10, IX: 9, V: 5, IV: 4,
  I: 1
};

function toRoman(num) {
  let result = "";
  for (let key in ROMAN_MAP) {
    while (num >= ROMAN_MAP[key]) {
      result += key;
      num -= ROMAN_MAP[key];
    }
  }
  return result;
}

function fromRoman(roman) {
  let result = 0;
  let i = 0;
  roman = roman.toUpperCase();

  while (i < roman.length) {
    let two = ROMAN_MAP[roman[i] + roman[i + 1]];
    let one = ROMAN_MAP[roman[i]];

    if (two) {
      result += two;
      i += 2;
    } else {
      result += one;
      i++;
    }
  }

  return result;
}

// ===============================
// RUTA API DESDE URL
// ===============================

app.get("/api/convert/:input", (req, res) => {
  const input = req.params.input;

  // Si es número → convertir a romano
  if (!isNaN(input)) {
    return res.json({
      input: input,
      result: toRoman(parseInt(input))
    });
  }

  // Si es romano → convertir a número
  return res.json({
    input: input,
    result: fromRoman(input)
  });
});

// ===============================
// MOSTRAR HTML
// ===============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
