// routes.js - Product API routes

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateProduct, NotFoundError, ValidationError } = require('./middleware');

const router = express.Router();

let products = []; // Will be set from server.js

// Setter function to update products array from external (server.js)
const setProducts = (newProducts) => {
  products = newProducts;
};

router.setProducts = setProducts;

// GET /products - List all products with filtering by category and pagination
router.get('/products', (req, res, next) => {
  try {
    let filtered = [...products];
    const { category, page = 1, limit = 10 } = req.query;

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginated = filtered.slice(start, end);

    res.json({
      products: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum)
    });
  } catch (error) {
    next(error);
  }
});

// GET /products/:id - Get a specific product by ID
router.get('/products/:id', (req, res, next) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /products - Create a new product
router.post('/products', validateProduct, (req, res, next) => {
  try {
    const newProduct = {
      id: uuidv4(),
      ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// PUT /products/:id - Update an existing product
router.put('/products/:id', validateProduct, (req, res, next) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      throw new NotFoundError('Product not found');
    }
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } catch (error) {
    next(error);
  }
});

// DELETE /products/:id - Delete a product
router.delete('/products/:id', (req, res, next) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      throw new NotFoundError('Product not found');
    }
    products.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /products/search?q=<query> - Search products by name
router.get('/products/search', (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      throw new ValidationError('Query parameter q is required for search');
    }
    const searchResults = products.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase())
    );
    res.json(searchResults);
  } catch (error) {
    next(error);
  }
});

// GET /products/stats - Get product statistics (count by category)
router.get('/products/stats', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

module.exports = router;