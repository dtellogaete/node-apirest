/* Pool */
const { Pool } = require('pg');
const format = require('format');

require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  allowExitOnIdle: process.env.ALLOW_EXIT_ON_IDLE === 'true',
};

const pool = new Pool(config);

/* Verificar conexión a la base de datos */
pool.connect((err, client, done) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
    } else {
      console.log('Conexión exitosa a la base de datos');
      done(); // Liberar cliente de la pool
    }
  });

/* Get Joyas*/
const getJoyas = async ({ limits = 10, order_by = "id_ASC", page = 0 }) => {
  const offset = page * limits;
  const field_order = order_by.split('_');
  const query = 'SELECT * FROM inventario ORDER BY $1 LIMIT $2 OFFSET $3';
  const values = [field_order, limits, offset];
  const { rows: joyas } = await pool.query(query, values);  
  return joyas;
};

/* Filtros */
/*
a. precio_max: Filtrar las joyas con un precio mayor al valor recibido
b. precio_min: Filtrar las joyas con un precio menor al valor recibido.
c. categoria: Filtrar las joyas por la categoría
d. metal: Filtrar las joyas por la categoría
*/

const getJoyasByFilters = async ({ limits = 10, order_by = "id_ASC", page = 0, precio_max = null, precio_min = null, categoria = null, metal = null }) => {
  const offset = page * limits;
  const [field, order] = order_by.split('_');
 
  let conditions = []; 
  if (precio_max != null) {
    conditions.push(`precio < ${precio_max}`);    
  }
  if (precio_min != null) {
    conditions.push(`precio > ${precio_min}`);   
  }
  if (categoria != null) {
    conditions.push(`categoria = '${categoria}'`);   
  }
  if (metal != null) {
    conditions.push(`metal = '${metal}'`);    
  }

  let conditionQuery = '';
  if (conditions.length > 0) {
    conditionQuery = `WHERE ${conditions.join(' AND ')}`;  }

  const formattedQuery = format('SELECT * FROM inventario %s ORDER BY %s %s LIMIT %s OFFSET %s', conditionQuery, field, order, limits, offset);
  const { rows: joyas } = await pool.query(formattedQuery);  

  return joyas;
};

module.exports = { getJoyas, getJoyasByFilters};
