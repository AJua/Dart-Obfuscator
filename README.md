# Code Obfuscator

A VSCode extension that obfuscates code in multiple languages by intelligently renaming symbols with random names while preserving framework functionality.

**Supported Languages**: C#, Python, TypeScript/JavaScript, Dart/Flutter

## Prerequisites

**IMPORTANT**: This extension requires language-specific VSCode extensions to function properly. Install the appropriate extension(s) for your target language:

### Required Language Extensions

| Language | Required Extension | Marketplace Link |
|----------|-------------------|------------------|
| **C#** | C# Dev Kit or C# | [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) |
| **Python** | Python | [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) |
| **TypeScript/JS** | Built-in | No additional extension needed |
| **Dart/Flutter** | Dart + Flutter | [Dart](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code) + [Flutter](https://marketplace.visualstudio.com/items?itemName=Dart-Code.flutter) |

### Why These Extensions Are Required

This extension uses VSCode's language server APIs (`executeDocumentSymbolProvider` and `executeDocumentRenameProvider`) to:
- Detect symbols in your code (classes, methods, variables, etc.)
- Perform safe rename refactoring across all references
- Preserve framework-specific methods and built-in functions

**Without the proper language extensions, you'll get "No symbols found" errors.**

## Features

- 🔒 **Multi-Language Support**: C#, Python, TypeScript/JavaScript, Dart/Flutter
- 🎯 **Smart Language Detection**: Automatically detects your project language (priority: C# > Python > TypeScript > Dart)
- 🛡️ **Framework-Aware**: Preserves framework methods for each language (.NET, Django/Flask, React/Node.js, Flutter)
- ⚡ **IDE Integration**: Uses VSCode's built-in rename refactoring for safe, reference-aware obfuscation
- 🎲 **Collision Prevention**: Generates unique random names (3-12 characters) across the entire codebase
- 📊 **Detailed Logging**: Comprehensive output showing what's being obfuscated

## Known Issues

**Dart/Flutter**: When renaming a field of class, the constructor with named parameter of its subclass won't be updated and cause compile error. This issue was due to a Dart LSP server bug in older Flutter versions (like 3.14). The latest Flutter versions have resolved this issue.

## Installation

1. Install from the VSCode Marketplace
2. Or install manually:
   - Download the `.vsix` file from releases
   - Open VSCode Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run `Extensions: Install from VSIX...`
   - Select the downloaded file

## Usage

1. **Install Prerequisites**: Make sure you have the required language extension installed (see Prerequisites section above)
2. **Open Project**: Open a supported project (C#, Python, TypeScript/JS, or Dart/Flutter) in VSCode
3. **Wait for Language Server**: Allow the language server to fully initialize (you should see symbols in the outline view)
4. **Run Obfuscation**: Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run: **"Obfuscate Code"**
5. **Monitor Progress**: View detailed progress in the "Code Obfuscator" output panel
6. **Check Results**: Find the symbol mappings in `symbols_{language}.txt` (e.g., `symbols_python.txt`)

![screenshot](/images/screenshot.png)

### What Gets Obfuscated

The extension renames all user-defined symbols including:
- Classes and abstract classes
- Methods and functions
- Fields and variables
- Properties (getters/setters)
- Named constructors
- Enums and enum values
- Type definitions

### What Gets Preserved

Language-specific framework detection automatically skips:

**C#/.NET:**
- Built-ins: `ToString`, `GetHashCode`, `Equals`, `Main`, etc.
- ASP.NET: `Configure`, `ConfigureServices`, `Startup`, etc.
- Entity Framework: `OnConfiguring`, `SaveChanges`, etc.

**Python:**
- Built-ins: `__init__`, `__str__`, `__repr__`, `main`, etc.
- Django: `save`, `clean`, `get_absolute_url`, etc.
- Flask: `before_request`, `after_request`, etc.

**TypeScript/JavaScript:**
- Built-ins: `toString`, `constructor`, etc.
- React: `render`, `componentDidMount`, `useState`, etc.
- Node.js: `listen`, `use`, `get`, `post`, etc.

**Dart/Flutter:**
- Built-ins: `toString`, `hashCode`, `main`, etc.
- Flutter Lifecycle: `build`, `initState`, `dispose`, etc.
- Flutter Callbacks: `onPressed`, `onTap`, `validator`, etc.

## Excluding Files (`.obfuscateignore`)

To skip specific paths or files from obfuscation, create a `.obfuscateignore` file in your workspace root — one path/pattern per line, gitignore-style:

```
# Generated files, never touch
lib/l10n
*.g.dart
build/
/legacy_module
```

Supported syntax:
- One pattern per line; blank lines and `#` comments are ignored
- Wildcards `*` and `**` (uses VSCode's native glob matching)
- No leading `/` → matches at any depth (`lib/l10n` matches that path anywhere in the workspace)
- Leading `/` → matches only from the workspace root (`/legacy_module`)
- A trailing `/` is optional — `build/` and `build` behave the same
- Each pattern matches both the entry itself and everything under it (if it's a directory)

Not supported: negation (`!pattern`) and nested per-directory ignore files — only one `.obfuscateignore` at the workspace root is read. This only affects which files get processed for obfuscation; it doesn't change language auto-detection.

## Example Output

```
=== PYTHON CODE OBFUSCATION ===
Processing workspace: my_python_app

--- File: main.py ---
  Requesting symbols for python file...
  Symbol provider returned: 8 symbols
  Found symbols: UserRole (Enum), User (Class), UserManager (Class), main (Function)
  Obfuscating Enum: UserRole -> Kx9mPq4
    ✓ Successfully obfuscated to Kx9mPq4
  Obfuscating Class: User -> ZtR8wX
    ✓ Successfully obfuscated to ZtR8wX
  Skipping Method: __init__ (Python framework or built-in method)
  Obfuscating Method: get_display_name -> qR7sT2nM
    ✓ Successfully obfuscated to qR7sT2nM

=== OBFUSCATION COMPLETE ===
Total symbols obfuscated: 23
Symbol mappings saved to symbols_python.txt
```

## Benefits

- **Code Protection**: Makes reverse engineering significantly more difficult
- **Intellectual Property**: Protects proprietary algorithms and business logic
- **Performance**: Focused scanning of only essential directories
- **Safety**: Framework-aware obfuscation prevents app breakage
- **Reliability**: Uses VSCode's proven rename refactoring engine

## Requirements

- VSCode 1.74.0 or higher
- Dart/Flutter project workspace

## Extension Settings

No VSCode settings required - works out of the box with sensible defaults. To exclude paths from obfuscation, add a `.obfuscateignore` file (see [Excluding Files](#excluding-files-obfuscateignore) above).

## Known Limitations

- Only processes files in `/lib` and `/test` directories
- Cannot obfuscate external package dependencies
- Some dynamic reflection-based code may require manual exclusion

## Contributing

Issues and pull requests are welcome! Please visit our [GitHub repository](https://github.com/username/dart-obfuscator).

## License

This extension is licensed under the [MIT License](LICENSE).

## Release Notes

### 1.0.0

Initial release with core obfuscation functionality:
- Smart Flutter framework detection
- Focused `/lib` and `/test` processing
- Comprehensive symbol type support
- Safe rename refactoring integration

---

**Enjoy secure coding!** 🔐
