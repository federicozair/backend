import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 🛠️ Configuración de rutas y archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// 🛠️ Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const productsFile = path.join(__dirname, 'productos.json');
const cartsFile = path.join(__dirname, 'carrito.json');

// 🔹 Función para leer archivos JSON
const readFile = async (file) => {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// 🔹 Función para escribir archivos JSON
const writeFile = async (file, data) => {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
};

// 📌 Rutas de productos
const productsRouter = express.Router();
productsRouter.get('/', async (req, res) => {
    const products = await readFile(productsFile);
    res.render("home", { title: "Lista de Productos", products });
});

// Endpoint con WebSockets
productsRouter.get('/realtimeproducts', async (req, res) => {
    const products = await readFile(productsFile);
    res.render("realTimeProducts", { title: "Productos en Tiempo Real", products });
});

productsRouter.post('/', async (req, res) => {
    const products = await readFile(productsFile);
    const newProduct = { id: products.length + 1, status: true, ...req.body };
    products.push(newProduct);
    await writeFile(productsFile, products);

    io.emit('updateProducts', products); // Enviar actualización a WebSockets
    res.status(201).json(newProduct);
});

productsRouter.delete('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const filteredProducts = products.filter(p => p.id != req.params.pid);
    await writeFile(productsFile, filteredProducts);

    io.emit('updateProducts', filteredProducts); // Enviar actualización a WebSockets
    res.send('Producto eliminado');
});

app.use('/api/products', productsRouter);

// Servidor HTTP con WebSockets
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.get('/', async (req, res) => {
    const products = await readFile(productsFile);
    res.render("home", { title: "Lista de Productos", products });
});
