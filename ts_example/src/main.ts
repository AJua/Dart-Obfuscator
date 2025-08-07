/**
 * Main entry point for TypeScript obfuscation testing.
 */

import { User, UserRole, UserService, UserManager } from './user';
import { Product, ProductCategory, ProductService } from './product';

function createSampleUsers(userService: UserService): void {
    console.log('Creating sample users...');
    
    const users = [
        { name: 'Alice Admin', email: 'alice@example.com', role: UserRole.Admin },
        { name: 'Bob Member', email: 'bob@example.com', role: UserRole.Member },
        { name: 'Charlie Guest', email: 'charlie@example.com', role: UserRole.Guest }
    ];

    users.forEach(userData => {
        const userId = userService.addUser({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isActive: true
        });
        console.log(`Added user: ${userData.name} (ID: ${userId})`);
    });
}

function createSampleProducts(productService: ProductService): void {
    console.log('Creating sample products...');
    
    const products = [
        {
            name: 'Gaming Laptop',
            price: 1299.99,
            category: ProductCategory.Electronics,
            description: 'High-performance gaming laptop with RTX graphics'
        },
        {
            name: 'Wireless Headphones',
            price: 199.99,
            category: ProductCategory.Electronics,
            description: 'Premium noise-canceling wireless headphones'
        },
        {
            name: 'Programming T-Shirt',
            price: 24.99,
            category: ProductCategory.Clothing,
            description: 'Comfortable cotton t-shirt with coding humor'
        },
        {
            name: 'Clean Code Book',
            price: 39.99,
            category: ProductCategory.Books,
            description: 'Essential book for software developers'
        }
    ];

    products.forEach(productData => {
        const productId = productService.addProduct({
            name: productData.name,
            price: productData.price,
            category: productData.category,
            description: productData.description,
            isAvailable: true
        });
        console.log(`Added product: ${productData.name} (ID: ${productId})`);
    });
}

function demonstrateUserManagement(): void {
    console.log('\n=== User Management Demo ===');
    
    const userService = new UserService();
    const userManager = new UserManager(userService);
    
    // Add event listeners
    userManager.addEventListener('userCreated', (data: any) => {
        console.log(`Event: User created - ${data.name} (${data.role})`);
    });
    
    userManager.addEventListener('userDeleted', (data: any) => {
        console.log(`Event: User deleted - ID ${data.userId}`);
    });
    
    // Create users through manager
    createSampleUsers(userService);
    
    // Print statistics
    console.log('\nUser Statistics:');
    userService.printUserStats();
    
    // Demonstrate user operations
    const allUsers = userService.getAllUsers();
    console.log('\nAll Users:');
    allUsers.forEach(user => {
        console.log(`  ${user.getInfo()}`);
        console.log(`    Admin: ${user.isAdmin()}`);
        console.log(`    Age: ${user.getAgeInDays()} days`);
    });
    
    // Test permissions
    const adminUser = allUsers.find(u => u.role === UserRole.Admin);
    const memberUser = allUsers.find(u => u.role === UserRole.Member);
    
    if (adminUser && memberUser) {
        console.log(`\nPermission Tests:`);
        console.log(`  Admin has admin permission: ${adminUser.hasPermission(UserRole.Admin)}`);
        console.log(`  Member has admin permission: ${memberUser.hasPermission(UserRole.Admin)}`);
        console.log(`  Member has member permission: ${memberUser.hasPermission(UserRole.Member)}`);
    }
}

function demonstrateProductManagement(): void {
    console.log('\n=== Product Management Demo ===');
    
    const productService = new ProductService();
    
    createSampleProducts(productService);
    
    // Print statistics
    console.log('\nProduct Statistics:');
    productService.printProductStats();
    
    // Demonstrate product operations
    const allProducts = productService.getAllProducts();
    console.log('\nAll Products:');
    allProducts.forEach(product => {
        console.log(`  ${product.getProductSummary()}`);
        console.log(`    Expensive: ${product.isExpensive()}`);
        console.log(`    Available: ${product.isAvailable}`);
    });
    
    // Apply discounts
    console.log('\nApplying 10% discount to first product...');
    if (allProducts.length > 0) {
        const firstProduct = allProducts[0];
        const originalPrice = firstProduct.price;
        firstProduct.applyDiscount(10);
        console.log(`  Price changed from $${originalPrice.toFixed(2)} to ${firstProduct.getFormattedPrice()}`);
    }
    
    // Find most/least expensive
    const mostExpensive = productService.getMostExpensiveProduct();
    const cheapest = productService.getCheapestProduct();
    
    console.log(`\nPrice Analysis:`);
    console.log(`  Most expensive: ${mostExpensive?.getProductSummary()}`);
    console.log(`  Cheapest: ${cheapest?.getProductSummary()}`);
    console.log(`  Average price: $${productService.getAveragePrice().toFixed(2)}`);
    
    // Search demonstration
    console.log(`\nSearch Results for "gaming":`);
    const searchResults = productService.searchProducts('gaming');
    searchResults.forEach(product => {
        console.log(`  ${product.getProductSummary()}`);
    });
}

function main(): void {
    console.log('TypeScript Obfuscation Testing Demo');
    console.log('====================================');
    
    demonstrateUserManagement();
    demonstrateProductManagement();
    
    console.log('\nTypeScript example completed!');
}

// Run the main function
main();