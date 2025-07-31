const fs = require('fs');
const path = require('path');

// Simple symbol detection for demonstration
function findDartSymbols(content, filePath) {
    const symbols = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Classes
        const classMatch = line.match(/^class\s+(\w+)/);
        if (classMatch) {
            symbols.push({
                kind: 'Class',
                name: classMatch[1],
                line: lineNum,
                detail: line.trim()
            });
        }
        
        // Abstract classes
        const abstractClassMatch = line.match(/^abstract class\s+(\w+)/);
        if (abstractClassMatch) {
            symbols.push({
                kind: 'Class',
                name: abstractClassMatch[1],
                line: lineNum,
                detail: line.trim()
            });
        }
        
        // Methods/Functions
        const methodMatch = line.match(/^\s*(static\s+)?(Future<[^>]+>|[A-Za-z_][A-Za-z0-9_<>]*)\s+(\w+)\s*\(/);
        if (methodMatch && !line.includes('//')) {
            symbols.push({
                kind: 'Method',
                name: methodMatch[3],
                line: lineNum,
                detail: line.trim()
            });
        }
        
        // Properties/Fields
        const fieldMatch = line.match(/^\s*(final|static|const)?\s*([A-Za-z_][A-Za-z0-9_<>]*)\s+(\w+);?/);
        if (fieldMatch && !line.includes('//') && !line.includes('(')) {
            symbols.push({
                kind: 'Field',
                name: fieldMatch[3],
                line: lineNum,
                detail: line.trim()
            });
        }
        
        // Enums
        const enumMatch = line.match(/^enum\s+(\w+)/);
        if (enumMatch) {
            symbols.push({
                kind: 'Enum',
                name: enumMatch[1],
                line: lineNum,
                detail: line.trim()
            });
        }
        
        // Constructors
        const constructorMatch = line.match(/^\s*(\w+)\s*\(/);
        if (constructorMatch && line.includes('{') && !line.includes('=')) {
            symbols.push({
                kind: 'Constructor',
                name: constructorMatch[1],
                line: lineNum,
                detail: line.trim()
            });
        }
    });
    
    return symbols;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        console.log(`\n--- File: ${relativePath} ---`);
        
        const symbols = findDartSymbols(content, filePath);
        
        if (symbols.length > 0) {
            symbols.forEach(symbol => {
                console.log(`  ${symbol.kind}: ${symbol.name} (line ${symbol.line})`);
                console.log(`    Detail: ${symbol.detail}`);
            });
        } else {
            console.log('  No symbols found');
        }
        
    } catch (error) {
        console.log(`Error processing ${filePath}: ${error.message}`);
    }
}

function findDartFiles(dir) {
    const dartFiles = [];
    
    function scan(directory) {
        const files = fs.readdirSync(directory);
        
        files.forEach(file => {
            const fullPath = path.join(directory, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (file.endsWith('.dart')) {
                dartFiles.push(fullPath);
            }
        });
    }
    
    scan(dir);
    return dartFiles;
}

// Main execution
console.log('=== DART SYMBOL PRINTER DEMO ===');
console.log('Scanning dart_example folder...\n');

const dartExamplePath = path.join(__dirname, 'dart_example');

if (fs.existsSync(dartExamplePath)) {
    const dartFiles = findDartFiles(dartExamplePath);
    console.log(`Found ${dartFiles.length} Dart files`);
    
    dartFiles.forEach(processFile);
} else {
    console.log('dart_example folder not found');
}

console.log('\n=== SYMBOL DISCOVERY COMPLETE ===');