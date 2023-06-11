# README - API REST

## Instalación

1. Ejecutar el siguiente comando para instalar las dependencias necesarias:
   ```
   npm i -y
   ```

## Uso

Una vez instaladas las dependencias, se debe ejecutar el siguiente comando 
   ```
   npm run start
   ```

# README - Backend

El backend de esta aplicación consta de dos funciones principales:

Claro, aquí tienes la explicación con el código incluido:

El siguiente código proporciona dos funciones relacionadas con la obtención de joyas de una base de datos.

La función, `getJoyas`, recibe parámetros opcionales como límites, orden y página. 

```javascript
/* Get Joyas */
const getJoyas = async ({ limits = 10, order_by = "id_ASC", page = 0 }) => {
  const offset = page * limits;
  const field_order = order_by.split('_');
  const query = 'SELECT * FROM inventario ORDER BY $1 LIMIT $2 OFFSET $3';
  const values = [field_order, limits, offset];
  const { rows: joyas } = await pool.query(query, values);  
  return joyas;
};
```

La función `getJoyasByFilters`, es similar a la primera, pero también permite filtrar las joyas utilizando parámetros adicionales. Puedes filtrar las joyas por precio máximo, precio mínimo, categoría y metal. 

```javascript
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
    conditions.push(`categoria = ${categoria}`);   
  }
  if (metal != null) {
    conditions.push(`metal = ${metal}`);    
  }

  let conditionQuery = '';
  if (conditions.length > 0) {
    conditionQuery = `WHERE ${conditions.join(' AND ')}`;  }

  const formattedQuery = format('SELECT * FROM inventario %s ORDER BY %s %s LIMIT %s OFFSET %s', conditionQuery, field, order, limits, offset);
  const { rows: joyas } = await pool.query(formattedQuery);  

  return joyas;
};
```

Estas funciones pueden ser utilizadas para obtener joyas de la base de datos y aplicar filtros según sea necesario.

Con Express, se implementan las siguientes obtener los datos:

Claro, aquí tienes la explicación con el código incluido:

El siguiente código proporciona dos rutas en una aplicación web que utilizan las funciones previamente definidas para obtener joyas de una base de datos y aplicar filtros.

La primera ruta, `/joyas`, es una ruta GET que utiliza la función `getJoyas` para obtener todas las joyas. Los parámetros de consulta se pasan a la función `getJoyas` utilizando `req.query`.

```javascript
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
```

### Ejemplo de Uso

#### Obtener Joyas 

**URL:** `http://localhost:3000/joyas`

**Respuesta:**

```json
    {
    "totalJoyas": 6,
    "totalStock": 27,
    "result": [
        {
        "name": "Collar Heart",
        "href": "joyas/joya/1",
        "stock": 2
        },
        {
        "name": "Collar History",
        "href": "joyas/joya/2",
        "stock": 5
        },
        {
        "name": "Aros Berry",
        "href": "joyas/joya/3",
        "stock": 10
        },
        {
        "name": "Aros Hook Blue",
        "href": "joyas/joya/4",
        "stock": 4
        },
        {
        "name": "Anillo Wish",
        "href": "joyas/joya/5",
        "stock": 4
        },
        {
        "name": "Anillo Cuarzo Greece",
        "href": "joyas/joya/6",
        "stock": 2
        }
    ]
    }
```

La segunda ruta, `/joyas/filtros`, es también una ruta GET que utiliza la función `getJoyasByFilters` para obtener joyas filtradas según los parámetros de consulta. 

```javascript
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
```
### Ejemplo de Uso

#### Obtener Joyas Filtradas

**URL:** `http://localhost:3000/joyas/filtros?precio_min=15000&precio_max=30000&categoria=aros&metal=oro`

**Respuesta:**

```json
    {
    "joyas": [
        {
        "id": 4,
        "nombre": "Aros Hook Blue",
        "categoria": "aros",
        "metal": "oro",
        "precio": 25000,
        "stock": 4
        }
    ]
    }
```

## Base de datos

Esta API utiliza una base de datos Postgresql llamada `joyas` y una conexión a través de `pool`. 

La estructura de la base de datos es la siguiente: 

```sql
CREATE DATABASE joyas;

CREATE TABLE inventario (id SERIAL, nombre VARCHAR(50), categoria VARCHAR(50), metal VARCHAR(50), precio INT, stock INT);

INSERT INTO inventario values
(DEFAULT, 'Collar Heart', 'collar', 'oro', 20000 , 2),
(DEFAULT, 'Collar History', 'collar', 'plata', 15000 , 5),
(DEFAULT, 'Aros Berry', 'aros', 'oro', 12000 , 10),
(DEFAULT, 'Aros Hook Blue', 'aros', 'oro', 25000 , 4),
(DEFAULT, 'Anillo Wish', 'aros', 'plata', 30000 , 4),
(DEFAULT, 'Anillo Cuarzo Greece', 'anillo', 'oro', 40000 , 2);
```
