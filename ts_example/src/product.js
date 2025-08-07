"use strict";
/**
 * Product management module for TypeScript obfuscation testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = exports.Product = exports.ProductCategory = void 0;
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["Electronics"] = "electronics";
    ProductCategory["Clothing"] = "clothing";
    ProductCategory["Books"] = "books";
    ProductCategory["Home"] = "home";
    ProductCategory["Sports"] = "sports";
})(ProductCategory = exports.ProductCategory || (exports.ProductCategory = {}));
class Product {
    constructor(name, price, category, description) {
        this.id = 0;
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
        this.isAvailable = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    calculateDiscountedPrice(discountPercentage) {
        return this.price * (1 - discountPercentage / 100);
    }
    applyDiscount(discountPercentage) {
        this.price = this.calculateDiscountedPrice(discountPercentage);
        this.updateTimestamp();
    }
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
    isExpensive(threshold = 100) {
        return this.price > threshold;
    }
    markUnavailable() {
        this.isAvailable = false;
        this.updateTimestamp();
    }
    markAvailable() {
        this.isAvailable = true;
        this.updateTimestamp();
    }
    updateTimestamp() {
        this.updatedAt = new Date();
    }
    getCategoryDisplayName() {
        return this.category.charAt(0).toUpperCase() + this.category.slice(1);
    }
    getProductSummary() {
        return `${this.name} - ${this.getFormattedPrice()} (${this.getCategoryDisplayName()})`;
    }
    hasDescription() {
        return !!this.description && this.description.trim().length > 0;
    }
    toString() {
        return this.getProductSummary();
    }
}
exports.Product = Product;
class ProductService {
    constructor() {
        this.products = new Map();
        this.nextId = 1;
    }
    addProduct(productData) {
        const product = new Product(productData.name, productData.price, productData.category, productData.description);
        product.id = this.nextId;
        product.isAvailable = productData.isAvailable;
        this.products.set(this.nextId, product);
        return this.nextId++;
    }
    getProductById(id) {
        return this.products.get(id) || null;
    }
    getAllProducts() {
        return Array.from(this.products.values());
    }
    getAvailableProducts() {
        return this.getAllProducts().filter(product => product.isAvailable);
    }
    getProductsByCategory(category) {
        return this.getAllProducts().filter(product => product.category === category);
    }
    updateProduct(id, updates) {
        const product = this.products.get(id);
        if (!product) {
            return false;
        }
        Object.assign(product, updates);
        product.updatedAt = new Date();
        return true;
    }
    removeProduct(id) {
        return this.products.delete(id);
    }
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllProducts().filter(product => product.name.toLowerCase().includes(lowerQuery) ||
            (product.description && product.description.toLowerCase().includes(lowerQuery)));
    }
    getProductCount() {
        return this.products.size;
    }
    getAveragePrice() {
        const products = this.getAllProducts();
        if (products.length === 0) {
            return 0;
        }
        const total = products.reduce((sum, product) => sum + product.price, 0);
        return total / products.length;
    }
    getMostExpensiveProduct() {
        const products = this.getAllProducts();
        if (products.length === 0) {
            return null;
        }
        return products.reduce((most, current) => current.price > most.price ? current : most);
    }
    getCheapestProduct() {
        const products = this.getAllProducts();
        if (products.length === 0) {
            return null;
        }
        return products.reduce((cheapest, current) => current.price < cheapest.price ? current : cheapest);
    }
    printProductStats() {
        console.log(`Total products: ${this.getProductCount()}`);
        console.log(`Available products: ${this.getAvailableProducts().length}`);
        console.log(`Average price: $${this.getAveragePrice().toFixed(2)}`);
        Object.values(ProductCategory).forEach(category => {
            const count = this.getProductsByCategory(category).length;
            console.log(`${category} products: ${count}`);
        });
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.js.map