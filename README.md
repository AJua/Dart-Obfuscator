# Dart Code Obfuscator VSCode Extension

A VSCode extension that leverages the IDE's API to iterate through and print all symbols in a Dart project, and obfuscate code by renaming symbols with random names.

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
- **Code Obfuscation**: Applies IDE's rename refactoring to replace symbol names with random alphanumeric names (3-12 characters)
- **Flutter-Aware**: Automatically detects and preserves Flutter framework methods to maintain app functionality

## Usage

### Automatic Scanning
The extension automatically activates and scans for symbols when you open a workspace containing Dart files.

### Manual Commands
Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:

**Print Symbols:**
```
Print Dart Symbols
```

**Obfuscate Code:**
```
Obfuscate Dart Code (Random Names)
```

This command will:
- Find all renameable symbols in your Dart project (classes, methods, functions, variables, fields, etc.)
- Generate random alphanumeric names (3-12 characters, starting with a letter)
- Use VSCode's rename refactoring to replace original names with random names
- Update all references throughout the codebase
- Ensure no duplicate names are generated
- Skip symbols that cannot be renamed (built-in methods, special symbols)
- Provide comprehensive obfuscation for code protection

#### Symbol Types Supported
The extension attempts to rename all symbol types including:
- **Classes** - User-defined classes and abstract classes
- **Methods** - Instance and static methods  
- **Functions** - Top-level and nested functions
- **Fields/Variables** - Instance fields, static fields, local variables
- **Properties** - Getters and setters
- **Constructors** - Named and default constructors
- **Enums** - Enum types and values
- **TypeDefs** - Type aliases

#### Symbols Automatically Skipped
- **Dart Built-ins**: `toString`, `hashCode`, `operator==`, `runtimeType`, `noSuchMethod`, etc.
- **Entry Points**: `main` function
- **Flutter Framework Methods**: 
  - Widget lifecycle: `build`, `initState`, `dispose`, `didChangeDependencies`, `didUpdateWidget`
  - State management: `setState`, `createState`, `mounted`, `widget`, `context`
  - Callbacks: `onPressed`, `onTap`, `onChanged`, `validator`, `builder`
  - Animation: `addListener`, `removeListener`, `forward`, `reverse`, `animateTo`
  - Navigation: `push`, `pop`, `pushReplacement`, `pushNamed`
  - Common patterns: `copyWith`, `lerp`, `of`, `maybeOf`
- **Pattern-based Detection**: Methods starting with `didChange`, `on` (callbacks), ending with `Builder`/`Delegate`/`Handler`
- **File/Module/Package** symbols and primitive types

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

### Obfuscation Output
```
=== DART CODE OBFUSCATION ===
Starting symbol obfuscation...
Renaming all renameable symbols with random names...

Processing workspace: dart_example

--- File: lib/models/user.dart ---
  Obfuscating Class: User -> Kx9mPq4
    ✓ Successfully obfuscated to Kx9mPq4
  Obfuscating Field: id -> aB7N
    ✓ Successfully obfuscated to aB7N
  Obfuscating Field: name -> ZtR8wX
    ✓ Successfully obfuscated to ZtR8wX
  Obfuscating Constructor: User -> Kx9mPq4
    ✓ Successfully obfuscated to Kx9mPq4
  Obfuscating Method: fromJson -> pL3vK9mN
    ✓ Successfully obfuscated to pL3vK9mN
  Skipping Method: toString (Flutter framework or built-in method)
  Skipping Method: build (Flutter framework or built-in method)
  Skipping Method: initState (Flutter framework or built-in method)
  Obfuscating Method: updateActiveStatus -> qR7sT2nM
    ✓ Successfully obfuscated to qR7sT2nM

--- File: lib/services/user_service.dart ---
  Obfuscating Class: UserService -> yU5hJ8
    ✓ Successfully obfuscated to yU5hJ8
  Obfuscating Method: getAllUsers -> nK6fD9vB
    ✓ Successfully obfuscated to nK6fD9vB
  Obfuscating Function: generateUserId -> mH3tL7pQ
    ✓ Successfully obfuscated to mH3tL7pQ

=== OBFUSCATION COMPLETE ===
Total symbols obfuscated: 12
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

The extension uses VSCode's `vscode.executeDocumentSymbolProvider` command to get symbols for each Dart file, and `vscode.executeDocumentRenameProvider` for safe obfuscation. This leverages the same symbol information and rename functionality that powers VSCode's outline view and refactoring features.

### Obfuscation Algorithm
- Generates random names with length 3-12 characters
- Always starts with a letter (a-z, A-Z) for valid identifier compliance
- Remaining characters can be letters or numbers (a-z, A-Z, 0-9)
- Maintains a unique names registry to prevent collisions
- Falls back to timestamp suffix if collision detection fails

### Key Components

- **package.json**: Extension manifest with activation events and commands
- **src/extension.ts**: Main extension logic
- **tsconfig.json**: TypeScript configuration
- **dart_example/**: Sample Dart project for testing

The extension activates on `onLanguage:dart` events and provides a `dart-symbol-printer.printSymbols` command for manual execution.