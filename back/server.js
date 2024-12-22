const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// Configuración del servidor
const app = express();
const port = 5000;

// MongoDB URI y nombre de la base de datos/colección
const uri = "mongodb+srv://nnnnnachooooo:KGIfJXc8jHZCzgKa@cluster0.poemx.mongodb.net/";
const dbName = "coches"; // Nombre de la base de datos
const collectionName = "tasador"; // Nombre de la colección

app.use(cors());
app.use(express.json());

// Función para conectarse a MongoDB
async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  return { client, collection };
}

// Utilidades para filtrar datos
const filterUniqueSorted = (data, key) => Array.from(new Set(data.map(item => item[key]))).sort();

// Rutas API
app.get("/api/marcas", async (req, res) => {
  const { client, collection } = await connectToDatabase();
  try {
    const marcas = await collection.distinct("marca");
    res.json(marcas.sort());
  } finally {
    client.close();
  }
});

app.get("/api/modelos", async (req, res) => {
  const { marca } = req.query;
  const { client, collection } = await connectToDatabase();
  try {
    const modelos = await collection.distinct("modelo", { marca });
    res.json(modelos.sort());
  } finally {
    client.close();
  }
});

app.get("/api/anos", async (req, res) => {
  const { marca, modelo } = req.query;
  const { client, collection } = await connectToDatabase();
  try {
    const anos = await collection.distinct("año", { marca, modelo });
    res.json(anos.sort());
  } finally {
    client.close();
  }
});

app.get("/api/versiones", async (req, res) => {
  const { marca, modelo, año } = req.query;
  const { client, collection } = await connectToDatabase();
  try {
    const versiones = await collection.distinct("version", { marca, modelo, año });
    res.json(versiones.sort());
  } finally {
    client.close();
  }
});

app.get("/api/combustibles", async (req, res) => {
  const { marca, modelo, año, version } = req.query;
  const { client, collection } = await connectToDatabase();
  try {
    const combustibles = await collection.distinct("combustible", { marca, modelo, año, version });
    res.json(combustibles.sort());
  } finally {
    client.close();
  }
});

app.get("/api/tasacion", async (req, res) => {
  const { marca, modelo, año, version, combustible, kilometros } = req.query;
  const { client, collection } = await connectToDatabase();
  try {
    const filteredCars = await collection.find({ marca, modelo, año, version, combustible }).toArray();

    if (filteredCars.length === 0) {
      return res.json({ precio: "No disponible" });
    }

    // Calcular precio promedio
    const precioTotal = filteredCars.reduce((total, coche) => {
      const precioNumerico = parseFloat(coche.precio.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, ""));
      return total + precioNumerico;
    }, 0);

    const precioPromedio = precioTotal / filteredCars.length;
    const precioFinal = kilometros ? calculateDiscountedPrice(precioPromedio, kilometros) : precioPromedio;

    res.json({ precio: formatPrice(precioFinal) });
  } finally {
    client.close();
  }
});

// Funciones auxiliares
const calculateDiscountedPrice = (basePrice, kilometers) => {
  const km = parseInt(kilometers.replace(/[^0-9]/g, ""), 10);
  let discount = 0;

  if (km > 200000) discount = 0.50;
  else if (km > 150000) discount = 0.40;
  else if (km > 100000) discount = 0.30;
  else if (km > 50000) discount = 0.20;

  return basePrice * (1 - discount);
};

const formatPrice = price => {
  return price.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(",", "."); // Esto reemplaza la coma por el punto solo si se requiere
};

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
