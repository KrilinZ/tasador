const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();
const port = 5000;


// Habilitar CORS y JSON
app.use(cors());
app.use(express.json());


// Leer el archivo JSON de los coches
const getCarsData = () => {
 const dataPath = path.join(__dirname, "cars.json");
 const rawData = fs.readFileSync(dataPath, "utf-8");
 return JSON.parse(rawData);
};


// Utilidades para filtrar datos y calcular precios
const filterUniqueSorted = (data, key) => Array.from(new Set(data.map(item => item[key]))).sort();


const calculateDiscountedPrice = (basePrice, kilometers) => {
 const km = parseInt(kilometers.replace(/[^0-9]/g, ""), 10);
 let discount = 0;


 if (km > 200000) discount = 0.50;
 else if (km > 150000) discount = 0.40;
 else if (km > 100000) discount = 0.30;
 else if (km > 50000) discount = 0.20;


 return basePrice * (1 - discount);
};


const formatPrice = price => price.toLocaleString("es-ES", {
 style: "currency",
 currency: "EUR",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
}).replace(",", ".");


// Rutas API
app.get("/api/marcas", (req, res) => {
 const carsData = getCarsData();
 const marcas = filterUniqueSorted(carsData, "marca");
 res.json(marcas);
});


app.get("/api/modelos", (req, res) => {
 const { marca } = req.query;
 const carsData = getCarsData();
 const modelos = filterUniqueSorted(carsData.filter(coche => coche.marca === marca), "modelo");
 res.json(modelos);
});


app.get("/api/anos", (req, res) => {
 const { marca, modelo } = req.query;
 const carsData = getCarsData();
 const anos = filterUniqueSorted(carsData.filter(coche => coche.marca === marca && coche.modelo === modelo), "año");
 res.json(anos);
});


app.get("/api/versiones", (req, res) => {
 const { marca, modelo, año } = req.query;
 const carsData = getCarsData();
 const versiones = filterUniqueSorted(carsData.filter(coche => coche.marca === marca && coche.modelo === modelo && coche.año === año), "version");
 res.json(versiones);
});


app.get("/api/combustibles", (req, res) => {
 const { marca, modelo, año, version } = req.query;
 const carsData = getCarsData();
 const combustibles = filterUniqueSorted(carsData.filter(coche =>
   coche.marca === marca &&
   coche.modelo === modelo &&
   coche.año === año &&
   coche.version === version
 ), "combustible");
 res.json(combustibles);
});


app.get("/api/tasacion", (req, res) => {
 const { marca, modelo, año, version, combustible, kilometros } = req.query;
 const carsData = getCarsData();


 // Filtrar coches según los parámetros proporcionados
 const filteredCars = carsData.filter(coche =>
   coche.marca === marca &&
   coche.modelo === modelo &&
   coche.version === version &&
   coche.año === año &&
   coche.combustible === combustible
 );


 if (filteredCars.length === 0) {
   return res.json({ precio: "No disponible" });
 }


 // Calcular el precio promedio
 const precioTotal = filteredCars.reduce((total, coche) => {
   try {
     const precioNumerico = parseFloat(coche.precio.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, ""));
     if (isNaN(precioNumerico)) throw new Error("Precio no válido");
     return total + precioNumerico;
   } catch (error) {
     console.error(`Error al procesar el precio: ${error}`);
     return total;
   }
 }, 0);


 const precioPromedio = precioTotal / filteredCars.length;
 const precioFinal = kilometros ? calculateDiscountedPrice(precioPromedio, kilometros) : precioPromedio;
 res.json({ precio: formatPrice(precioFinal) });
});


// Iniciar el servidor
app.listen(port, () => {
 console.log(`Server running at http://localhost:${port}`);
});
