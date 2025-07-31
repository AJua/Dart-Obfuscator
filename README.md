# Dart Code Obfuscator

A VSCode extension that obfuscates Dart and Flutter code by intelligently renaming symbols with random names while preserving framework functionality.

## Features

- 🔒 **Code Obfuscation**: Replaces symbol names with random alphanumeric names (3-12 characters)
- 🎯 **Smart Targeting**: Only processes `/lib` and `/test` folders for faster performance
- 🛡️ **Flutter-Aware**: Automatically preserves Flutter framework methods to maintain app functionality
- ⚡ **IDE Integration**: Uses VSCode's built-in rename refactoring for safe, reference-aware obfuscation
- 🎲 **Collision Prevention**: Ensures unique name generation across the entire codebase

## Installation

1. Install from the VSCode Marketplace
2. Or install manually:
   - Download the `.vsix` file from releases
   - Open VSCode Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run `Extensions: Install from VSIX...`
   - Select the downloaded file

## Usage

1. Open a Dart/Flutter project in VSCode
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run: **"Obfuscate Dart Code (Random Names)"**
4. View progress in the "Dart Code Obfuscator" output panel

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

Smart detection automatically skips:
- **Dart Built-ins**: `toString`, `hashCode`, `operator==`, `main`, etc.
- **Flutter Lifecycle**: `build`, `initState`, `dispose`, `didChangeDependencies`, etc.
- **Flutter Callbacks**: `onPressed`, `onTap`, `onChanged`, `validator`, etc.
- **Flutter Patterns**: Methods starting with `didChange`, `on` (callbacks), ending with `Builder`/`Delegate`/`Handler`
- **Framework Methods**: `setState`, `createState`, `mounted`, `context`, etc.
- **Animation/Controller**: `addListener`, `forward`, `reverse`, `animateTo`, etc.
- **Navigation**: `push`, `pop`, `pushReplacement`, `pushNamed`, etc.
- **Common Patterns**: `copyWith`, `lerp`, `of`, `maybeOf`, etc.

## Example Output

```
=== DART CODE OBFUSCATION ===
Processing workspace: my_flutter_app

--- File: lib/models/user.dart ---
  Obfuscating Class: User -> Kx9mPq4
    ✓ Successfully obfuscated to Kx9mPq4
  Obfuscating Field: name -> ZtR8wX
    ✓ Successfully obfuscated to ZtR8wX
  Skipping Method: build (Flutter framework method)
  Obfuscating Method: updateProfile -> qR7sT2nM
    ✓ Successfully obfuscated to qR7sT2nM

=== OBFUSCATION COMPLETE ===
Total symbols obfuscated: 47
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

No configuration required - works out of the box with sensible defaults.

## Known Limitations

- Only processes files in `/lib` and `/test` directories
- Cannot obfuscate external package dependencies
- Some dynamic reflection-based code may require manual exclusion

## Contributing

Issues and pull requests are welcome! Please visit our [GitHub repository](https://github.com/username/dart-code-obfuscator).

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