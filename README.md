# Dart Symbol Printer VSCode Extension

A VSCode extension that leverages the IDE's API to iterate through and print all symbols in a Dart project.

## Features

- **Symbol Discovery**: Automatically scans all `.dart` files in the workspace
- **Symbol Information**: Uses VSCode's built-in symbol provider API for accurate symbol detection
- **Detailed Output**: Prints symbol information including:
  - Symbol type (Class, Method, Field, Constructor, etc.)
  - Symbol name
  - Location (line and character ranges)
  - Additional details when available
- **Hierarchical Support**: Supports nested symbols (methods within classes, etc.)
- **Auto-activation**: Auto-runs when a Dart project is opened
- **Manual Commands**: Two commands available via Command Palette
- **Refactoring**: Applies IDE's rename refactoring to add "prefix_" to Class and Method symbols

## Usage

### Automatic Scanning
The extension automatically activates and scans for symbols when you open a workspace containing Dart files.

### Manual Commands
Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:

**Print Symbols:**
```
Print Dart Symbols
```

**Refactor Symbols:**
```
Refactor Dart Symbols (Add prefix_)
```

This command will:
- Find all Class and Method symbols in your Dart project
- Use VSCode's rename refactoring to add "prefix_" to their names
- Update all references throughout the codebase
- Skip symbols that already have the prefix

### Viewing Output
Symbol information is displayed in VSCode's Output panel under "Dart Symbol Printer". The extension automatically opens this output channel when scanning symbols.

## Installation

1. Compile the extension:
   ```bash
   npm install
   npm run compile
   ```

2. Package the extension (optional):
   ```bash
   npx vsce package
   ```

3. Install in VSCode:
   - Press `F5` to run in Extension Development Host
   - Open the `dart_example` folder in the new VSCode window that opens
   - The extension will automatically run and show output in the "Dart Symbol Printer" output channel
   - Or manually run "Print Dart Symbols" from the Command Palette

## Example Output

### Symbol Printing Output
```
=== DART SYMBOL PRINTER ===
Starting symbol discovery...

Processing workspace: dart_example

--- File: lib/models/user.dart ---
Class: User (5:1-81:2)
  Detail: User
  Field: id (6:3-6:20)
  Field: name (9:3-9:23)
  Constructor: User (21:3-26:5)
  Method: fromJson (29:3-36:4)
  Method: toJson (39:3-46:4)

=== SYMBOL DISCOVERY COMPLETE ===
```

### Refactoring Output
```
=== DART SYMBOL REFACTORING ===
Starting symbol refactoring...
Adding "prefix_" to Class and Method symbols...

Processing workspace: dart_example

--- File: lib/models/user.dart ---
  Renaming Class: User -> prefix_User
    ✓ Successfully renamed to prefix_User
  Renaming Method: fromJson -> prefix_fromJson
    ✓ Successfully renamed to prefix_fromJson
  Renaming Method: toJson -> prefix_toJson
    ✓ Successfully renamed to prefix_toJson

--- File: lib/services/user_service.dart ---
  Renaming Class: UserService -> prefix_UserService
    ✓ Successfully renamed to prefix_UserService
  Renaming Method: getAllUsers -> prefix_getAllUsers
    ✓ Successfully renamed to prefix_getAllUsers

=== REFACTORING COMPLETE ===
Total symbols renamed: 8
```

## Demo

The repository includes a `dart_example` folder with sample Dart code demonstrating various symbol types:

- **Models**: User class with fields, constructors, and methods
- **Services**: Abstract and concrete service classes
- **Tests**: Unit tests with test groups and cases
- **Enums**: Environment configuration enum
- **Utilities**: Static utility methods

Run `node test_symbols.js` to see a simplified version of what the extension detects.

## Technical Details

The extension uses VSCode's `vscode.executeDocumentSymbolProvider` command to get symbols for each Dart file. This leverages the same symbol information that powers VSCode's outline view and other navigation features.

### Key Components

- **package.json**: Extension manifest with activation events and commands
- **src/extension.ts**: Main extension logic
- **tsconfig.json**: TypeScript configuration
- **dart_example/**: Sample Dart project for testing

The extension activates on `onLanguage:dart` events and provides a `dart-symbol-printer.printSymbols` command for manual execution.