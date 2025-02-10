import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 8080;
app.use(express.json());

const productsFile = path.join(__dirname, 'productos.json');
const cartsFile = path.join(__dirname, 'carrito.json');

const readFile = async (file) => {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeFile = async (file, data) => {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
};

const productsRouter = express.Router();
productsRouter.get('/', async (req, res) => {
    const products = await readFile(productsFile);
    const limit = parseInt(req.query.limit);
    res.json(limit ? products.slice(0, limit) : products);
});

productsRouter.get('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const product = products.find(p => p.id == req.params.pid);
    product ? res.json(product) : res.status(404).send('Producto no encontrado');
});

productsRouter.post('/', async (req, res) => {
    const products = await readFile(productsFile);
    const newProduct = { id: products.length + 1, status: true, ...req.body };
    products.push(newProduct);
    await writeFile(productsFile, products);
    res.status(201).json(newProduct);
});

productsRouter.put('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index === -1) return res.status(404).send('Producto no encontrado');
    products[index] = { ...products[index], ...req.body, id: products[index].id };
    await writeFile(productsFile, products);
    res.json(products[index]);
});

productsRouter.delete('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const filteredProducts = products.filter(p => p.id != req.params.pid);
    await writeFile(productsFile, filteredProducts);
    res.send('Producto eliminado');
});

const cartsRouter = express.Router();
cartsRouter.post('/', async (req, res) => {
    const carts = await readFile(cartsFile);
    const newCart = { id: carts.length + 1, products: [] };
    carts.push(newCart);
    await writeFile(cartsFile, carts);
    res.status(201).json(newCart);
});

cartsRouter.get('/:cid', async (req, res) => {
    const carts = await readFile(cartsFile);
    const cart = carts.find(c => c.id == req.params.cid);
    cart ? res.json(cart) : res.status(404).send('Carrito no encontrado');
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const carts = await readFile(cartsFile);
    const products = await readFile(productsFile);
    const cart = carts.find(c => c.id == req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    if (!products.find(p => p.id == req.params.pid)) return res.status(404).send('Producto no encontrado');
    
    const existingProduct = cart.products.find(p => p.product == req.params.pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }
    await writeFile(cartsFile, carts);
    res.json(cart);
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
