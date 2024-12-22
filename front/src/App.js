import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import logo from './assets/logo.png'; // Importa el logo


function App() {
 const [marca, setMarca] = useState("");
 const [modelo, setModelo] = useState("");
 const [año, setAño] = useState("");
 const [version, setVersion] = useState("");
 const [combustible, setCombustible] = useState("");
 const [kilometros, setKilometros] = useState("");
 const [precioTasacion, setPrecioTasacion] = useState("");


 const [marcasDisponibles, setMarcasDisponibles] = useState([]);
 const [modelosDisponibles, setModelosDisponibles] = useState([]);
 const [anosDisponibles, setAnosDisponibles] = useState([]);
 const [versionesDisponibles, setVersionesDisponibles] = useState([]);
 const [combustiblesDisponibles, setCombustiblesDisponibles] = useState([]);


 useEffect(() => {
   axios.get("http://localhost:5000/api/marcas")
     .then(response => setMarcasDisponibles(response.data));
 }, []);


 useEffect(() => {
   if (marca) {
     axios.get(`http://localhost:5000/api/modelos?marca=${marca}`)
       .then(response => setModelosDisponibles(response.data));
   }
 }, [marca]);


 useEffect(() => {
   if (marca && modelo) {
     axios.get(`http://localhost:5000/api/anos?marca=${marca}&modelo=${modelo}`)
       .then(response => setAnosDisponibles(response.data));
   }
 }, [marca, modelo]);


 useEffect(() => {
   if (marca && modelo && año) {
     axios.get(`http://localhost:5000/api/versiones?marca=${marca}&modelo=${modelo}&año=${año}`)
       .then(response => setVersionesDisponibles(response.data));
   }
 }, [marca, modelo, año]);


 useEffect(() => {
   if (marca && modelo && año && version) {
     axios.get(`http://localhost:5000/api/combustibles?marca=${marca}&modelo=${modelo}&año=${año}&version=${version}`)
       .then(response => setCombustiblesDisponibles(response.data));
   }
 }, [marca, modelo, año, version]);


 const handleTasacion = (e) => {
   e.preventDefault();
   axios.get("http://localhost:5000/api/tasacion", {
     params: { marca, modelo, año, version, combustible, kilometros }
   })
     .then(response => setPrecioTasacion(response.data.precio));
 };


 return (
   <div>
    <img src={logo} alt="Logo" className="app-logo" />
     <h1>Tasador de Coches</h1>
     <form onSubmit={handleTasacion}>
       <div>
         <label>Marca:</label>
         <select value={marca} onChange={(e) => setMarca(e.target.value)}>
           <option value="">Selecciona una marca</option>
           {marcasDisponibles.map(m => (
             <option key={m} value={m}>{m}</option>
           ))}
         </select>
       </div>


       <div>
         <label>Modelo:</label>
         <select value={modelo} onChange={(e) => setModelo(e.target.value)} disabled={!marca}>
           <option value="">Selecciona un modelo</option>
           {modelosDisponibles.map(m => (
             <option key={m} value={m}>{m}</option>
           ))}
         </select>
       </div>


       <div>
         <label>Año:</label>
         <select value={año} onChange={(e) => setAño(e.target.value)} disabled={!modelo}>
           <option value="">Selecciona un año</option>
           {anosDisponibles.map(a => (
             <option key={a} value={a}>{a}</option>
           ))}
         </select>
       </div>


       <div>
         <label>Versión:</label>
         <select value={version} onChange={(e) => setVersion(e.target.value)} disabled={!año}>
           <option value="">Selecciona una versión</option>
           {versionesDisponibles.map(v => (
             <option key={v} value={v}>{v}</option>
           ))}
         </select>
       </div>


       <div>
         <label>Combustible:</label>
         <select value={combustible} onChange={(e) => setCombustible(e.target.value)} disabled={!version}>
           <option value="">Selecciona un combustible</option>
           {combustiblesDisponibles.map(c => (
             <option key={c} value={c}>{c}</option>
           ))}
         </select>
       </div>


       <div>
         <label>Kilómetros:</label>
         <input type="text" value={kilometros} onChange={(e) => setKilometros(e.target.value)} />
       </div>


       <button type="submit">Obtener Tasación</button>
     </form>


     <h2 class="precio-tasacion">Precio Tasación: {precioTasacion}</h2>
   </div>
 );
}


export default App;
