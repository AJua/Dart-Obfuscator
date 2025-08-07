/**
 * Product management module for TypeScript obfuscation testing.
 */

export interface IProduct {
    id: number;
    name: string;
    price: number;
    category: ProductCategory;
    description?: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProductCategory {
    Electronics = 'electronics',
    Clothing = 'clothing',
    Books = 'books',
    Home = 'home',
    Sports = 'sports'
}

export interface IProductService {
    addProduct(product: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): number;
    getProductById(id: number): IProduct | null;
    getAllProducts(): IProduct[];
    updateProduct(id: number, updates: Partial<IProduct>): boolean;
    removeProduct(id: number): boolean;
}

export class Product implements IProduct {
    public id: number = 0;
    public name: string;
    public price: number;
    public category: ProductCategory;
    public description?: string;
    public isAvailable: boolean;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(
        name: string,
        price: number,
        category: ProductCategory,
        description?: string
    ) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
        this.isAvailable = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public calculateDiscountedPrice(discountPercentage: number): number {
        return this.price * (1 - discountPercentage / 100);
    }

    public applyDiscount(discountPercentage: number): void {
        this.price = this.calculateDiscountedPrice(discountPercentage);
        this.updateTimestamp();
    }

    public getFormattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }

    public isExpensive(threshold: number = 100): boolean {
        return this.price > threshold;
    }

    public markUnavailable(): void {
        this.isAvailable = false;
        this.updateTimestamp();
    }

    public markAvailable(): void {
        this.isAvailable = true;
        this.updateTimestamp();
    }

    private updateTimestamp(): void {
        this.updatedAt = new Date();
    }

    public getCategoryDisplayName(): string {
        return this.category.charAt(0).toUpperCase() + this.category.slice(1);
    }

    public getProductSummary(): string {
        return `${this.name} - ${this.getFormattedPrice()} (${this.getCategoryDisplayName()})`;
    }

    public hasDescription(): boolean {
        return !!this.description && this.description.trim().length > 0;
    }

    public toString(): string {
        return this.getProductSummary();
    }
}

export class ProductService implements IProductService {
    private products: Map<number, Product> = new Map();
    private nextId: number = 1;

    public addProduct(productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): number {
        const product = new Product(
            productData.name,
            productData.price,
            productData.category,
            productData.description
        );
        
        product.id = this.nextId;
        product.isAvailable = productData.isAvailable;
        
        this.products.set(this.nextId, product);
        return this.nextId++;
    }

    public getProductById(id: number): IProduct | null {
        return this.products.get(id) || null;
    }

    public getAllProducts(): IProduct[] {
        return Array.from(this.products.values());
    }

    public getAvailableProducts(): IProduct[] {
        return this.getAllProducts().filter(product => product.isAvailable);
    }

    public getProductsByCategory(category: ProductCategory): IProduct[] {
        return this.getAllProducts().filter(product => product.category === category);
    }

    public updateProduct(id: number, updates: Partial<IProduct>): boolean {
        const product = this.products.get(id);
        if (!product) {
            return false;
        }

        Object.assign(product, updates);
        product.updatedAt = new Date();
        return true;
    }

    public removeProduct(id: number): boolean {
        return this.products.delete(id);
    }

    public searchProducts(query: string): IProduct[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllProducts().filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            (product.description && product.description.toLowerCase().includes(lowerQuery))
        );
    }

    public getProductCount(): number {
        return this.products.size;
    }

    public getAveragePrice(): number {
        const products = this.getAllProducts();
        if (products.length === 0) {
            return 0;
        }
        
        const total = products.reduce((sum, product) => sum + product.price, 0);
        return total / products.length;
    }

    public getMostExpensiveProduct(): IProduct | null {
        const products = this.getAllProducts();
        if (products.length === 0) {
            return null;
        }
        
        return products.reduce((most, current) => 
            current.price > most.price ? current : most
        );
    }

    public getCheapestProduct(): IProduct | null {
        const products = this.getAllProducts();
        if (products.length === 0) {
            return null;
        }
        
        return products.reduce((cheapest, current) => 
            current.price < cheapest.price ? current : cheapest
        );
    }

    public printProductStats(): void {
        console.log(`Total products: ${this.getProductCount()}`);
        console.log(`Available products: ${this.getAvailableProducts().length}`);
        console.log(`Average price: $${this.getAveragePrice().toFixed(2)}`);
        
        Object.values(ProductCategory).forEach(category => {
            const count = this.getProductsByCategory(category).length;
            console.log(`${category} products: ${count}`);
        });
    }
}