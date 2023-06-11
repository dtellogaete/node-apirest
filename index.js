/* Express */
const express = require('express');

/* Cors */
const cors = require('cors');

/* Import DB*/
const { getJoyas, getJoyasByFilters } = require('./db.js');
const { error } = require('console');
const e = require('express');

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Levantar el servidor con puerto 3002 */
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running in port: ${PORT}`);
});

/* GET Joyas */
app.get('/joyas', async (req, res) => {
  try {
    const joyas = await getJoyas(req.query);
    res.status(200).json({
      totalJoyas: joyas.length,
      totalStock: joyas.reduce((acc, joya) => acc + joya.stock, 0),
      result: joyas.map(joya => ({
        name: joya.nombre,
        href: `joyas/joya/${joya.id}`,
        stock: joya.stock,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/* GET Joyas Filters */
app.get('/joyas/filtros', async (req, res) => {
  try {
    const joyas = await getJoyasByFilters(req.query);
    res.status(200).json({
      joyas: joyas.map(joya => ({
        id: joya.id,
        nombre: joya.nombre,
        categoria: joya.categoria,
        metal: joya.metal,
        precio: joya.precio,
        stock: joya.stock,
      }))
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});
  