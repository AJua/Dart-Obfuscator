# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension called "Code Obfuscator" that provides code obfuscation for multiple programming languages. The extension intelligently renames user-defined symbols (classes, methods, fields, etc.) with random names while preserving framework-specific functionality to prevent code breakage. 

**Supported Languages (in priority order):**
1. **C#** - Supports .NET, ASP.NET Core, Entity Framework patterns
2. **Python** - Supports Django, Flask, common Python patterns  
3. **TypeScript/JavaScript** - Supports React, Node.js, Angular patterns
4. **Dart/Flutter** - Original Dart and Flutter support

## Prerequisites

**IMPORTANT**: This extension relies on VSCode language servers for symbol detection and renaming. You must have the appropriate language extensions installed for each language you want to obfuscate:

### Required Language Extensions

- **C#**: [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) or [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)
- **Python**: [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) 
- **TypeScript/JavaScript**: Built into VSCode (no additional extension needed)
- **Dart/Flutter**: [Dart](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code) and [Flutter](https://marketplace.visualstudio.com/items?itemName=Dart-Code.flutter)

### Language Server Requirements
The extension uses `vscode.executeDocumentSymbolProvider` and `vscode.executeDocumentRenameProvider` APIs, which depend on:
- Properly configured language servers for symbol detection
- Language server support for rename refactoring operations
- Active workspace with the target language files

**Without the proper language extensions, the obfuscation will fail with "No symbols found" errors.**

## Key Commands

### Build and Development
- `npm install` - Install dependencies (required before first build)
- `npm run compile` - Compiles TypeScript to JavaScript (outputs to `out/` directory)
- `npm run watch` - Watches for changes and auto-compiles TypeScript (recommended for development)
- `npm run vscode:prepublish` - Runs compile before publishing (same as compile)

### Testing the Extension
1. **Manual Testing in VSCode**:
   - Press `F5` in VSCode to launch Extension Development Host
   - Open one of the example directories (`csharp_example/`, `python_example/`, `ts_example/`, or `dart_example/`)
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run "Obfuscate Code"
   - Check the "Code Obfuscator" output panel for results

2. **Symbol Detection Testing**:
   - `node test_symbols.js` - Standalone script to test symbol detection patterns

### Extension Commands
- **"Obfuscate Code"** (`dart-obfuscator.obfuscateCode`) - Main command that obfuscates code in the workspace
- **Language Detection**: Automatically detects language with priority: C# > Python > TypeScript > Dart
- **Output Files**: Creates `symbols.json` with original→obfuscated name mappings in JSON format

## Architecture

### Core Components

**Main Extension (`src/extension.ts`)**
- Single-file extension that registers the obfuscation command
- Uses VSCode's built-in symbol provider and rename refactoring APIs
- Processes only `/lib` and `/test` directories for performance
- Generates `symbols.txt` file with original->obfuscated name mappings

**Symbol Processing Flow:**
1. **Language Detection**: Auto-detect project language by scanning for language-specific files
2. **File Discovery**: Scan workspace using language-specific patterns:
   - C#: `**/*.cs` files (excludes: `bin/`, `obj/`, `packages/`)
   - Python: `**/*.py` files (excludes: `__pycache__/`, `.venv/`, `venv/`, `site-packages/`)
   - TypeScript/JS: `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.js`, `src/**/*.jsx` (excludes: `node_modules/`, `dist/`, `build/`)
   - Dart: `lib/**/*.dart`, `test/**/*.dart`
3. **Symbol Extraction**: Use `vscode.executeDocumentSymbolProvider` to get symbols from each file
4. **Filtering**: Skip non-renameable symbols (constructors, framework methods, built-ins, language keywords)
5. **Rename Generation**: Generate collision-free random names (3-12 characters) using `generateObfuscatedName()`
6. **Safe Renaming**: Use `vscode.executeDocumentRenameProvider` for reference-aware renaming across the entire workspace
7. **Tracking**: Record all original→obfuscated mappings and output detailed results to VSCode output channel

**Framework Protection:**
The extension has extensive language-specific framework method skip lists:

**Dart/Flutter:** Widget lifecycle (`build`, `initState`), callbacks (`onPressed`, `onTap`), animations (`forward`, `reverse`)
**C#:** .NET built-ins (`ToString`, `GetHashCode`), ASP.NET (`Configure`, `ConfigureServices`), Entity Framework (`OnConfiguring`)
**Python:** Built-ins (`__init__`, `__str__`), Django (`save`, `clean`), Flask (`before_request`)
**TypeScript/JS:** React lifecycle (`componentDidMount`, `render`), Node.js (`listen`), common patterns (`useEffect`, `useState`)

### Key Files and Functions
- `src/extension.ts` (669 lines) - Single-file extension containing all core logic:
  - `activate()` - Extension activation and command registration
  - `obfuscateCode()` - Main obfuscation orchestrator
  - `detectWorkspaceLanguage()` - Auto-detects project language with priority ordering
  - `initializeLanguageConfigs()` - Configures language-specific settings and framework skip lists
  - `processWorkspaceForObfuscation()` - Processes all files in workspace with filtering
  - `obfuscateFileSymbols()` - Per-file symbol extraction and obfuscation
  - `obfuscateSymbols()` - Recursive symbol processing with rename application
  - `generateObfuscatedName()` - Collision-free random name generation
  - `writeSymbolsFile()` - Outputs mapping file
  - Language-specific framework detectors: `isFlutterFrameworkMethod()`, `isCSharpFrameworkMethod()`, `isPythonFrameworkMethod()`, `isTypeScriptFrameworkMethod()`
- `test_symbols.js` - Standalone symbol detection tester (doesn't require VSCode)
- `tsconfig.json` - TypeScript configuration (ES2020, strict mode, commonjs modules)

## Development Notes

### Extension Structure
- **Package Type**: Standard VSCode extension built with TypeScript
- **Module System**: CommonJS modules targeting ES2020
- **Entry Point**: `./out/extension.js` (compiled from `src/extension.ts`)
- **Activation Events**: Activates on language detection for `dart`, `csharp`, `python`, `typescript`, `javascript`
- **Dependencies**: Minimal - only uses VSCode API, Node.js `fs` and `path` modules (no external packages)
- **Architecture**: Single-file design (~669 lines) with language-specific configurations using strategy pattern

### Language Configuration System
The extension uses a `LanguageConfig` interface to support multiple languages with a unified architecture:

```typescript
interface LanguageConfig {
    name: string;                    // Language identifier (e.g., 'dart', 'python')
    displayName: string;             // Human-readable name (e.g., 'Dart/Flutter')
    fileExtensions: string[];        // File extensions to process
    filePatterns: string[];          // Glob patterns for file discovery
    skipNames: string[];             // Framework methods and built-ins to preserve
    isFrameworkMethod: (symbol) => boolean;  // Language-specific detection logic
}
```

Each language is registered in `initializeLanguageConfigs()` with comprehensive skip lists containing 50-100+ framework method names. To add support for a new language:
1. Create a new `LanguageConfig` in `initializeLanguageConfigs()`
2. Define file patterns and extensions
3. Build skip list of framework/built-in methods
4. Implement `isFrameworkMethod()` for pattern-based detection
5. Update priority order in `detectWorkspaceLanguage()`

### Symbol Detection and Renaming
- **Language Server Dependency**: Requires VSCode's language server for accurate symbol information (see Prerequisites)
- **Recursive Processing**: Handles nested symbols (classes within classes, methods within classes)
- **Reverse-Order Processing**: Sorts symbols by position in reverse order to avoid position shifts during rename
- **Retry Logic**: Python symbol detection includes retry mechanism (3 attempts with 500ms delay) due to slower language server initialization
- **Non-Renameable Types**: Automatically skips constructors, files, modules, namespaces, packages, and primitive types
- **Framework Detection**: Uses language-specific `isFrameworkMethod()` functions to identify framework overrides:
  - Checks for `@override` annotations (Dart)
  - Pattern matching on method names (e.g., `On*` event handlers in C#, `__*__` dunder methods in Python)
  - Detail string analysis for Widget types, interface implementations, etc.

### Known Limitations and Caveats
- **Directory Patterns**: Uses language-specific patterns (e.g., Python only searches `**/*.py`, TypeScript only `src/**/*.ts`) - files outside these patterns are not processed
- **External Dependencies**: Cannot obfuscate code in `node_modules/`, `site-packages/`, or other package directories
- **Language Server Required**: Extension fails silently or with "No symbols found" if the required language extension is not installed
- **Dart/Flutter**: Constructor with named parameters of subclasses may not update correctly (due to Dart LSP bug in older Flutter versions < 3.14)
- **Python/JS/TypeScript**: Dynamic reflection-based code (e.g., `getattr()`, `eval()`, dynamic property access) may break
- **C#**: Reflection-based code, attributes, and serialization may need manual exclusion from obfuscation
- **No Rollback**: Obfuscation directly modifies files with no automatic undo - commit your code before running
- **Single Language**: Each workspace is detected as one language only (highest priority language wins)

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

## Important Implementation Details

### Random Name Generation
- Uses `generateObfuscatedName()` to create 3-12 character random strings
- Character set: `[a-zA-Z]` (52 characters)
- Collision detection: Maintains `usedNames` Set to ensure global uniqueness
- Regenerates if collision detected (rare with 52^3 to 52^12 possible names)

### Symbol Mapping Output
- File format: JSON with metadata and mappings object
- Filename: `symbols.json` (always the same name, in workspace root)
- Written to workspace root directory
- Structure includes: language name, language ID, generation timestamp, total symbol count, and mappings
- Easily parseable for automation, reverse mapping, or integration with other tools

### Workspace Edit Application
- Uses VSCode's `WorkspaceEdit` API for atomic multi-file changes
- Rename operations are reference-aware (updates all usages across workspace)
- Failed renames are logged but don't stop the process
- Unused generated names are removed from `usedNames` on failure

### Progress Tracking and Logging
- **Visual Progress Bar**: VSCode notification shows real-time progress with percentage and file count (updates per file)
- **Time Tracking**: Displays total elapsed time in seconds upon completion
- **Detailed Output Logging**: "Code Obfuscator" output panel shows:
  - Progress updates every 5 files (to reduce log spam)
  - Symbol counts and rename success/failure per symbol
  - Symbol kind (Class, Method, Field, etc.) for each operation
  - Specific skip reasons for better debugging
- **Final Summary**: Completion message includes total symbols obfuscated and time elapsed

### Performance Optimization
- **Symbol Persistence**: Reuses existing mappings from `symbols.json` to avoid re-processing unchanged symbols
- **Sequential Processing**: Files and symbols are processed sequentially for stability and safety
- **Progress Updates**: Shows progress every 5 files to track long-running operations
- **Language Server Retry**: Python files include retry logic (3 attempts, 500ms delay) for slower language server initialization