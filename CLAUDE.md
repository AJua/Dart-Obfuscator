# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension called "Dart Obfuscator" that obfuscates Dart and Flutter code by intelligently renaming symbols with random names while preserving framework functionality. The extension is written in TypeScript and targets VSCode's extension API.

## Build and Development Commands

- **Compile TypeScript**: `npm run compile` - Compiles TypeScript to JavaScript in the `out/` directory
- **Watch mode**: `npm run watch` - Compiles TypeScript in watch mode for development
- **Prepare for publishing**: `npm run vscode:prepublish` - Runs compile script before publishing
- **Test symbol detection**: `node test_symbols.js` - Runs standalone test for symbol detection in dart_example/

## Architecture Overview

### Core Components

1. **Main Extension (`src/extension.ts`)**:
   - Entry point with `activate()` and `deactivate()` functions
   - Registers the `dart-obfuscator.obfuscateCode` command
   - Manages output channel for user feedback
   - Tracks global state: `usedNames` Set and `symbolMappings` Map

2. **Obfuscation Flow**:
   - `obfuscateDartCode()` → `processWorkspaceForObfuscation()` → `obfuscateFileSymbols()` → `obfuscateSymbols()`  
   - Only processes files in `/lib` and `/test` folders for performance
   - Uses VSCode's symbol provider (`vscode.executeDocumentSymbolProvider`) to discover symbols
   - Uses VSCode's rename provider (`vscode.executeDocumentRenameProvider`) for safe refactoring

3. **Smart Symbol Filtering**:
   - Skips non-renameable symbol types (constructors, built-ins)
   - Preserves Flutter framework methods via hardcoded skip list in `src/extension.ts:140-179`
   - Uses pattern detection in `isFlutterFrameworkMethod()` for dynamic framework method detection

4. **Name Generation**:
   - `generateObfuscatedName()` creates random 3-12 character alphanumeric names
   - Collision prevention using `usedNames` Set
   - Fallback to timestamp suffix after 1000 attempts

5. **Output Tracking**:
   - Creates `symbols.txt` with original → obfuscated mappings
   - Real-time progress in VSCode output channel

### Test Structure

- **dart_example/**: Sample Dart project for testing symbol detection
  - Contains typical Dart classes, methods, fields for validation
- **test_symbols.js**: Standalone Node.js script that demonstrates basic Dart symbol parsing using regex patterns

## Key Implementation Details

- **Symbol Processing Order**: Processes symbols in reverse line order to avoid position shifts during rename operations
- **Recursive Symbol Processing**: Handles nested symbols (class members, etc.) via recursive calls to `obfuscateSymbols()`
- **Framework Preservation**: Extensive skip lists for Dart built-ins and Flutter framework methods to prevent app breakage
- **Error Handling**: Comprehensive error handling with detailed output logging and graceful degradation

## Known Issues

When renaming a field of a class, the constructor with named parameter of its subclass won't be updated and causes compile errors. This issue was due to a Dart LSP server bug in older Flutter versions (like 3.14). The latest Flutter versions have resolved this issue.