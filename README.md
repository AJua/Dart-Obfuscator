# Dart Symbol Printer VSCode Extension

A VSCode extension that leverages the IDE's API to iterate through and print all symbols in a Dart project.

## Features

- Automatically scans all `.dart` files in the workspace
- Uses VSCode's built-in symbol provider API for accurate symbol detection
- Prints detailed symbol information including:
  - Symbol type (Class, Method, Field, Constructor, etc.)
  - Symbol name
  - Location (line and character ranges)
  - Additional details when available
- Supports nested symbols (methods within classes, etc.)
- Auto-runs when a Dart project is opened
- Manual command to re-scan symbols

## Usage

### Automatic Scanning
The extension automatically activates and scans for symbols when you open a workspace containing Dart files.

### Manual Scanning
Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:
```
Print Dart Symbols
```

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

```
=== DART SYMBOL PRINTER ===
Starting symbol discovery...

Processing workspace: dart_example

--- File: lib/models/user.dart ---
Class: User (5:1-81:2)
  Detail: User
  Field: id (6:3-6:20)
  Field: name (9:3-9:23)
  Field: email (12:3-12:24)
  Constructor: User (21:3-26:5)
  Method: fromJson (29:3-36:4)
  Method: toJson (39:3-46:4)
  Method: toString (74:3-76:4)

--- File: lib/services/user_service.dart ---
Class: UserService (4:1-19:2)
  Method: getAllUsers (6:3-6:42)
  Method: getUserById (9:3-9:45)
  Method: createUser (12:3-12:41)

=== SYMBOL DISCOVERY COMPLETE ===
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