import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Language configuration interface
interface LanguageConfig {
    name: string;
    displayName: string;
    fileExtensions: string[];
    filePatterns: string[];
    skipNames: string[];
    isFrameworkMethod: (symbol: vscode.DocumentSymbol) => boolean;
}

let outputChannel: vscode.OutputChannel;
let usedNames = new Set<string>();
let symbolMappings = new Map<string, string>();
let supportedLanguages: Map<string, LanguageConfig> = new Map();

export async function activate(context: vscode.ExtensionContext) {
    // Initialize language configurations
    initializeLanguageConfigs();
    
    // Create output channel for displaying results in user's VSCode
    outputChannel = vscode.window.createOutputChannel('Code Obfuscator');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('Code Obfuscator extension is now active!');

    // Register main obfuscation command
    let obfuscateDisposable = vscode.commands.registerCommand('dart-obfuscator.obfuscateCode', async () => {
        await obfuscateCode();
    });

    context.subscriptions.push(obfuscateDisposable);
}


function initializeLanguageConfigs() {
    // Dart/Flutter configuration
    supportedLanguages.set('dart', {
        name: 'dart',
        displayName: 'Dart/Flutter',
        fileExtensions: ['.dart'],
        filePatterns: ['lib/**/*.dart', 'test/**/*.dart'],
        skipNames: [
            // Dart built-ins
            'main', 'toString', 'hashCode', 'operator==', 'runtimeType', 'noSuchMethod',
            // Flutter Widget lifecycle methods
            'build', 'initState', 'dispose', 'didChangeDependencies', 'didUpdateWidget',
            'deactivate', 'activate', 'didChangeAppLifecycleState', 'didHaveMemoryPressure',
            'didChangeAccessibilityFeatures', 'didChangeTextScaleFactor', 'didChangeLocales',
            'didChangePlatformBrightness', 'didChangeMetrics', 'createState',
            // Flutter CustomPaint override methods
            'paint', 'shouldRepaint',
            // Equatable override
            'props',
            // Flutter State methods
            'setState', 'mounted', 'widget', 'context',
            // Flutter framework callbacks
            'onPressed', 'onTap', 'onChanged', 'onSubmitted', 'onEditingComplete',
            'onFieldSubmitted', 'onSaved', 'validator', 'builder',
            // Flutter animation methods
            'addListener', 'removeListener', 'addStatusListener', 'removeStatusListener',
            'forward', 'reverse', 'reset', 'stop', 'animateTo', 'animateWith',
            // Flutter controller methods
            'notifyListeners', 'hasListeners', 'clear', 'text', 'selection', 'value',
            // Flutter navigation methods
            'push', 'pop', 'pushReplacement', 'pushNamed', 'popUntil', 'canPop',
            // Flutter theme and localization
            'of', 'maybeOf', 'localizationsDelegates', 'supportedLocales',
            // Common Flutter patterns
            'copyWith', 'lerp', 'resolve', 'createTween', 'transform'
        ],
        isFrameworkMethod: isFlutterFrameworkMethod
    });
    
    // C# configuration
    supportedLanguages.set('csharp', {
        name: 'csharp',
        displayName: 'C#',
        fileExtensions: ['.cs'],
        filePatterns: ['**/*.cs', '!**/bin/**', '!**/obj/**', '!**/packages/**'],
        skipNames: [
            // .NET built-ins
            'Main', 'ToString', 'GetHashCode', 'Equals', 'GetType', 'Finalize',
            'MemberwiseClone', 'ReferenceEquals',
            // Common override methods
            'Dispose', 'DisposeAsync', 'Clone',
            // ASP.NET Core
            'Configure', 'ConfigureServices', 'Startup',
            // Entity Framework
            'OnConfiguring', 'OnModelCreating', 'SaveChanges', 'SaveChangesAsync',
            // Common interface methods
            'CompareTo', 'CopyTo', 'MoveTo',
            // Event handlers (common patterns)
            'OnClick', 'OnLoad', 'OnClosing', 'OnClosed',
            // WPF/WinForms
            'InitializeComponent', 'OnApplyTemplate'
        ],
        isFrameworkMethod: isCSharpFrameworkMethod
    });
    
    // Python configuration
    supportedLanguages.set('python', {
        name: 'python',
        displayName: 'Python',
        fileExtensions: ['.py'],
        filePatterns: ['**/*.py', '!**/venv/**', '!**/__pycache__/**', '!**/site-packages/**'],
        skipNames: [
            // Python built-ins
            '__init__', '__str__', '__repr__', '__len__', '__getitem__', '__setitem__',
            '__delitem__', '__iter__', '__next__', '__enter__', '__exit__',
            '__call__', '__getattr__', '__setattr__', '__delattr__',
            '__eq__', '__ne__', '__lt__', '__le__', '__gt__', '__ge__',
            '__hash__', '__bool__', '__bytes__', '__format__',
            '__add__', '__sub__', '__mul__', '__truediv__', '__floordiv__',
            '__mod__', '__pow__', '__and__', '__or__', '__xor__',
            '__lshift__', '__rshift__', '__invert__',
            'main', 'setUp', 'tearDown', 'setUpClass', 'tearDownClass',
            // Django
            'save', 'delete', 'clean', 'full_clean', 'get_absolute_url',
            'get_queryset', 'get_object', 'get_context_data',
            // Flask
            'before_request', 'after_request', 'teardown_request',
            // Common patterns
            'run', 'start', 'stop', 'close', 'open'
        ],
        isFrameworkMethod: isPythonFrameworkMethod
    });
    
    // TypeScript/JavaScript configuration
    supportedLanguages.set('typescript', {
        name: 'typescript',
        displayName: 'TypeScript/JavaScript',
        fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
        filePatterns: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx',
                      'lib/**/*.ts', 'lib/**/*.tsx', 'lib/**/*.js', 'lib/**/*.jsx',
                      '!**/node_modules/**', '!**/dist/**', '!**/build/**'],
        skipNames: [
            // JavaScript built-ins
            'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
            'propertyIsEnumerable', 'constructor',
            // React lifecycle
            'componentDidMount', 'componentDidUpdate', 'componentWillUnmount',
            'componentDidCatch', 'getSnapshotBeforeUpdate', 'shouldComponentUpdate',
            'render', 'setState', 'forceUpdate',
            // React hooks (common patterns)
            'useEffect', 'useState', 'useContext', 'useReducer', 'useMemo', 'useCallback',
            // Node.js
            'main', 'start', 'stop', 'close', 'listen',
            // Express.js
            'middleware', 'use', 'get', 'post', 'put', 'delete', 'patch',
            // Common patterns
            'init', 'destroy', 'dispose', 'cleanup'
        ],
        isFrameworkMethod: isTypeScriptFrameworkMethod
    });
}

async function obfuscateCode() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    // Detect language from workspace
    const detectedLanguage = await detectWorkspaceLanguage();
    if (!detectedLanguage) {
        vscode.window.showErrorMessage('No supported language detected in workspace');
        return;
    }

    const langConfig = supportedLanguages.get(detectedLanguage)!;
    
    // Clear previous output and show the output channel
    outputChannel.clear();
    outputChannel.show();

    // Clear used names set and symbol mappings for fresh obfuscation
    usedNames.clear();
    symbolMappings.clear();

    outputChannel.appendLine(`=== ${langConfig.displayName.toUpperCase()} CODE OBFUSCATION ===`);
    outputChannel.appendLine('Starting symbol obfuscation...');
    outputChannel.appendLine('Renaming all renameable symbols with random names...');

    let totalRenamed = 0;

    for (const folder of workspaceFolders) {
        outputChannel.appendLine(`\nProcessing workspace: ${folder.name}`);
        const renamedCount = await processWorkspaceForObfuscation(folder, langConfig);
        totalRenamed += renamedCount;
    }

    // Write symbols mapping to file
    if (symbolMappings.size > 0) {
        await writeSymbolsFile(detectedLanguage);
    }

    outputChannel.appendLine(`\n=== OBFUSCATION COMPLETE ===`);
    outputChannel.appendLine(`Total symbols obfuscated: ${totalRenamed}`);
    outputChannel.appendLine(`Symbol mappings saved to symbols_${detectedLanguage}.txt`);
    vscode.window.showInformationMessage(`Obfuscation complete! Obfuscated ${totalRenamed} ${langConfig.displayName} symbols. Symbol mappings saved to symbols_${detectedLanguage}.txt.`);
}

async function detectWorkspaceLanguage(): Promise<string | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;

    // Priority order: C# > Python > TypeScript > Dart
    const languagePriority = ['csharp', 'python', 'typescript', 'dart'];
    
    for (const lang of languagePriority) {
        const config = supportedLanguages.get(lang)!;
        let hasFiles = false;
        
        for (const folder of workspaceFolders) {
            for (const pattern of config.filePatterns) {
                const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, pattern));
                if (files.length > 0) {
                    hasFiles = true;
                    break;
                }
            }
            if (hasFiles) break;
        }
        
        if (hasFiles) {
            outputChannel.appendLine(`Detected language: ${config.displayName}`);
            return lang;
        }
    }
    
    return null;
}

async function processWorkspaceForObfuscation(folder: vscode.WorkspaceFolder, langConfig: LanguageConfig): Promise<number> {
    let allFiles: vscode.Uri[] = [];
    let patternCounts: { [pattern: string]: number } = {};
    
    // Process all file patterns for the language
    for (const pattern of langConfig.filePatterns) {
        if (pattern.startsWith('!')) {
            // Skip exclusion patterns (handled by findFiles automatically)
            continue;
        }
        
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, pattern));
        allFiles.push(...files);
        patternCounts[pattern] = files.length;
    }
    
    // Remove duplicates
    allFiles = [...new Map(allFiles.map(file => [file.fsPath, file])).values()];

    const patternInfo = Object.entries(patternCounts)
        .map(([pattern, count]) => `${pattern}: ${count}`)
        .join(', ');
    
    outputChannel.appendLine(`Found ${allFiles.length} ${langConfig.displayName} files in ${folder.name} (${patternInfo})`);

    let totalRenamed = 0;

    for (const fileUri of allFiles) {
        const renamedCount = await obfuscateFileSymbols(fileUri, langConfig);
        totalRenamed += renamedCount;
    }

    return totalRenamed;
}

async function obfuscateFileSymbols(fileUri: vscode.Uri, langConfig: LanguageConfig): Promise<number> {
    let renamedCount = 0;
    
    try {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const relativePath = vscode.workspace.asRelativePath(fileUri);
        
        outputChannel.appendLine(`\n--- File: ${relativePath} ---`);

        // Get document symbols
        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            fileUri
        );

        if (symbols && symbols.length > 0) {
            renamedCount = await obfuscateSymbols(symbols, fileUri, document, langConfig);
        } else {
            outputChannel.appendLine('  No symbols found');
        }

    } catch (error) {
        outputChannel.appendLine(`Error processing ${fileUri.fsPath}: ${error}`);
    }

    return renamedCount;
}

async function obfuscateSymbols(symbols: vscode.DocumentSymbol[], fileUri: vscode.Uri, document: vscode.TextDocument, langConfig: LanguageConfig): Promise<number> {
    let renamedCount = 0;
    
    // Process symbols in reverse order to avoid position shifts
    const sortedSymbols = [...symbols].sort((a, b) => b.range.start.line - a.range.start.line);
    
    for (const symbol of sortedSymbols) {
        // Recursively process child symbols first
        if (symbol.children && symbol.children.length > 0) {
            renamedCount += await obfuscateSymbols(symbol.children, fileUri, document, langConfig);
        }
        
        // Skip symbol types that typically cannot be renamed
        const nonRenameableTypes = [
            vscode.SymbolKind.Constructor,
            vscode.SymbolKind.File,
            vscode.SymbolKind.Module,
            vscode.SymbolKind.Namespace,
            vscode.SymbolKind.Package,
            vscode.SymbolKind.String,
            vscode.SymbolKind.Number,
            vscode.SymbolKind.Boolean,
            vscode.SymbolKind.Array,
            vscode.SymbolKind.Object,
            vscode.SymbolKind.Key,
            vscode.SymbolKind.Null
        ];

        // Use language-specific skip names and framework detection
        const shouldSkip = nonRenameableTypes.includes(symbol.kind) || 
                          langConfig.skipNames.includes(symbol.name) ||
                          langConfig.isFrameworkMethod(symbol);
        
        
        if (shouldSkip) {
            outputChannel.appendLine(`  Skipping ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} (${langConfig.displayName} framework or built-in method)`);
        } else {
            // Generate random obfuscated name
            const newName = generateObfuscatedName();
            
            try {
                outputChannel.appendLine(`  Obfuscating ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} -> ${newName}`);
                
                // Use VSCode's rename provider to rename the symbol
                const position = symbol.selectionRange.start;
                const workspaceEdit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
                    'vscode.executeDocumentRenameProvider',
                    fileUri,
                    position,
                    newName
                );
                
                if (workspaceEdit) {
                    const success = await vscode.workspace.applyEdit(workspaceEdit);
                    if (success) {
                        renamedCount++;
                        // Track the symbol mapping
                        symbolMappings.set(symbol.name, newName);
                        outputChannel.appendLine(`    ✓ Successfully obfuscated to ${newName}`);
                    } else {
                        outputChannel.appendLine(`    ✗ Failed to apply obfuscation for ${symbol.name}`);
                        // Remove the name from used set since it wasn't actually used
                        usedNames.delete(newName);
                    }
                } else {
                    outputChannel.appendLine(`    ✗ No rename edit provided for ${symbol.name} (symbol may not be renameable)`);
                    // Remove the name from used set since it wasn't actually used
                    usedNames.delete(newName);
                }
                
            } catch (error) {
                outputChannel.appendLine(`    ✗ Error obfuscating ${symbol.name}: ${error}`);
                // Remove the name from used set since it wasn't actually used
                usedNames.delete(newName);
            }
        }
    }
    
    return renamedCount;
}

function isFlutterFrameworkMethod(symbol: vscode.DocumentSymbol): boolean {
    // Check for common Flutter method patterns that shouldn't be renamed
    const name = symbol.name;
    
    // Override methods (typically start with specific patterns)
    if (name.startsWith('didChange') || name.startsWith('willChange') || 
        name.startsWith('on') && name.length > 2 && name[2] === name[2].toUpperCase()) {
        return true;
    }
    
    // Methods that commonly return Widget types (check if detail contains Widget)
    if (symbol.detail && (symbol.detail.includes('Widget') || symbol.detail.includes('State<'))) {
        return true;
    }
    
    // Getter/setter patterns commonly used in Flutter
    if ((name.startsWith('get') || name.startsWith('set')) && name.length > 3 && 
        name[3] === name[3].toUpperCase()) {
        return false; // These are often custom getters/setters, can be renamed
    }
    
    // Methods ending with common Flutter suffixes
    if (name.endsWith('Builder') || name.endsWith('Delegate') || name.endsWith('Handler')) {
        return true;
    }
    
    return false;
}

function isCSharpFrameworkMethod(symbol: vscode.DocumentSymbol): boolean {
    const name = symbol.name;
    
    // Event handlers (common C# patterns)
    if (name.startsWith('On') && name.length > 2 && name[2] === name[2].toUpperCase()) {
        return true;
    }
    
    // Property accessors
    if ((name.startsWith('get_') || name.startsWith('set_')) && name.length > 4) {
        return true;
    }
    
    // ASP.NET patterns
    if (name.endsWith('Controller') || name.endsWith('Service') || name.endsWith('Repository')) {
        return true;
    }
    
    // Attribute or interface patterns
    if (symbol.detail && (symbol.detail.includes('Attribute') || symbol.detail.includes('Interface'))) {
        return true;
    }
    
    return false;
}

function isPythonFrameworkMethod(symbol: vscode.DocumentSymbol): boolean {
    const name = symbol.name;
    
    // Private/protected methods (starting with underscore)
    if (name.startsWith('_') && !name.startsWith('__')) {
        return false; // Single underscore methods can be renamed
    }
    
    // Django model methods
    if (name.startsWith('get_') && name.endsWith('_display')) {
        return true;
    }
    
    // Flask route decorators or common patterns
    if (name.endsWith('_view') || name.endsWith('_handler')) {
        return true;
    }
    
    // Test methods
    if (name.startsWith('test_')) {
        return true;
    }
    
    return false;
}

function isTypeScriptFrameworkMethod(symbol: vscode.DocumentSymbol): boolean {
    const name = symbol.name;
    
    // React lifecycle methods patterns
    if (name.startsWith('component') && name.includes('Did')) {
        return true;
    }
    
    // React hook patterns
    if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
        return true;
    }
    
    // Event handlers (common patterns)
    if ((name.startsWith('on') || name.startsWith('handle')) && name.length > 2 && 
        name[2] === name[2].toUpperCase()) {
        return true;
    }
    
    // Angular patterns
    if (name.startsWith('ng') && name.length > 2 && name[2] === name[2].toUpperCase()) {
        return true;
    }
    
    // Common patterns
    if (name.endsWith('Handler') || name.endsWith('Callback') || name.endsWith('Listener')) {
        return true;
    }
    
    return false;
}

function generateObfuscatedName(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    let name: string;
    let attempts = 0;
    const maxAttempts = 1000;
    
    do {
        // Generate random length between 3 and 12
        const length = Math.floor(Math.random() * 10) + 3;
        
        // Start with a letter
        name = letters.charAt(Math.floor(Math.random() * letters.length));
        
        // Add remaining characters (letters or numbers)
        for (let i = 1; i < length; i++) {
            name += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
            // Fallback: add timestamp to ensure uniqueness
            name = name + Date.now().toString().slice(-4);
            break;
        }
    } while (usedNames.has(name));
    
    usedNames.add(name);
    return name;
}

async function writeSymbolsFile(language: string): Promise<void> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            outputChannel.appendLine('No workspace folder found for symbols.txt');
            return;
        }

        const symbolsFilePath = path.join(workspaceFolder.uri.fsPath, `symbols_${language}.txt`);
        
        const langConfig = supportedLanguages.get(language)!;
        // Create content with original -> obfuscated mappings
        let content = `# ${langConfig.displayName} Symbol Obfuscation Mappings\n`;
        content += '# Format: OriginalName -> ObfuscatedName\n';
        content += `# Generated: ${new Date().toISOString()}\n\n`;
        
        // Sort mappings alphabetically by original name for better readability
        const sortedMappings = Array.from(symbolMappings.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        for (const [originalName, obfuscatedName] of sortedMappings) {
            content += `${originalName} -> ${obfuscatedName}\n`;
        }
        
        // Write to file
        await fs.promises.writeFile(symbolsFilePath, content, 'utf8');
        outputChannel.appendLine(`Symbol mappings written to: ${symbolsFilePath}`);
        
    } catch (error) {
        outputChannel.appendLine(`Error writing symbols.txt: ${error}`);
    }
}

export function deactivate() {}
