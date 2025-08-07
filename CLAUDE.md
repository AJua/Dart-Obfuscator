# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension called "Code Obfuscator" that provides code obfuscation for multiple programming languages. The extension intelligently renames user-defined symbols (classes, methods, fields, etc.) with random names while preserving framework-specific functionality to prevent code breakage. 

**Supported Languages (in priority order):**
1. **C#** - Supports .NET, ASP.NET Core, Entity Framework patterns
2. **Python** - Supports Django, Flask, common Python patterns  
3. **TypeScript/JavaScript** - Supports React, Node.js, Angular patterns
4. **Dart/Flutter** - Original Dart and Flutter support

## Key Commands

### Build and Development
- `npm run compile` - Compiles TypeScript to JavaScript (outputs to `out/` directory)
- `npm run watch` - Watches for changes and auto-compiles TypeScript
- `npm run vscode:prepublish` - Runs compile before publishing (same as compile)

### Testing
- Use the included `test_symbols.js` script to test symbol detection: `node test_symbols.js`
- The `dart_example/` directory contains sample Dart code for testing the extension

### Extension Commands
- **"Obfuscate Code"** (`dart-obfuscator.obfuscateCode`) - Main command that obfuscates code in the workspace. Auto-detects language with priority: C# > Python > TypeScript > Dart

## Architecture

### Core Components

**Main Extension (`src/extension.ts`)**
- Single-file extension that registers the obfuscation command
- Uses VSCode's built-in symbol provider and rename refactoring APIs
- Processes only `/lib` and `/test` directories for performance
- Generates `symbols.txt` file with original->obfuscated name mappings

**Symbol Processing Flow:**
1. Scan workspace for `.dart` files in `/lib` and `/test` folders
2. Use `vscode.executeDocumentSymbolProvider` to get symbols from each file  
3. Filter out framework methods and non-renameable symbols
4. Generate random names (3-12 characters) for user-defined symbols
5. Use `vscode.executeDocumentRenameProvider` to safely rename symbols
6. Track mappings and output results to VSCode output channel

**Framework Protection:**
The extension has extensive language-specific framework method skip lists:

**Dart/Flutter:** Widget lifecycle (`build`, `initState`), callbacks (`onPressed`, `onTap`), animations (`forward`, `reverse`)
**C#:** .NET built-ins (`ToString`, `GetHashCode`), ASP.NET (`Configure`, `ConfigureServices`), Entity Framework (`OnConfiguring`)
**Python:** Built-ins (`__init__`, `__str__`), Django (`save`, `clean`), Flask (`before_request`)
**TypeScript/JS:** React lifecycle (`componentDidMount`, `render`), Node.js (`listen`), common patterns (`useEffect`, `useState`)

### Key Files
- `src/extension.ts:16` - Main command registration  
- `src/extension.ts:24` - Main obfuscation entry point
- `src/extension.ts:140-179` - Framework method skip list
- `src/extension.ts:234` - Flutter framework detection logic
- `src/extension.ts:263` - Random name generation
- `src/extension.ts:295` - Symbol mapping file generation

## Development Notes

### Extension Structure
- Built as a standard VSCode extension with TypeScript
- Uses commonjs modules targeting ES2020
- Output compiled to `out/extension.js` 
- Activates on multiple language detection: `dart`, `csharp`, `python`, `typescript`, `javascript`

### Symbol Detection
- Relies on VSCode's language server for accurate symbol information
- Processes symbols recursively (handles nested classes/methods)
- Sorts symbols by position to avoid rename conflicts
- Skips constructors and other non-renameable symbol types

### Known Limitations
- Uses language-specific directory patterns (may miss some files)
- Cannot obfuscate external package dependencies  
- Dart: Constructor with named parameters of subclasses may need manual fixes
- Python/JS: Some dynamic reflection-based code may break
- C#: Reflection-based code and attributes may need manual exclusion

### Testing Setup
Multiple example directories for testing different languages:

**`csharp_example/`** - C# project with:
- `Program.cs` - Main program with classes, interfaces, enums
- `Models/Product.cs` - Data models and business logic

**`python_example/`** - Python project with:
- `main.py` - Main module with classes, enums, inheritance
- `models/user_model.py` - Data models and user management

**`ts_example/`** - TypeScript project with:
- `src/user.ts` - User management classes and interfaces
- `src/product.ts` - Product service and business logic  
- `src/main.ts` - Main entry point and demonstrations
- `package.json` & `tsconfig.json` - Standard TS project setup

**`dart_example/`** - Original Dart project structure