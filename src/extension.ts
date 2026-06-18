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
            'DefaultFirebaseOptions', 'currentPlatform',
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
            'copyWith', 'lerp', 'resolve', 'createTween', 'transform',
            // HTTP client overrides (BaseClient, HttpClient)
            'send', 'close', 'open', 'read', 'write', 'flush', 'listen',
            // LocalizationsDelegate overrides
            'load', 'isSupported', 'shouldReload',
            // Dart Object/Comparable overrides
            'compareTo', 'call',
            // Iterable/Stream overrides
            'map', 'where', 'fold', 'reduce', 'any', 'every', 'expand',
            'contains', 'elementAt', 'firstWhere', 'lastWhere', 'singleWhere',
            'skip', 'take', 'toList', 'toSet', 'join', 'forEach',
            // Serialization conventions
            'fromJson', 'toJson', 'fromMap', 'toMap',
            // State restoration
            'restoreState', 'saveState',
            // ChangeNotifier / ValueNotifier (duplicates kept for clarity)
            // 'addListener', 'removeListener', 'notifyListeners', 'hasListeners' already listed above
            // TickerProvider
            'createTicker',
            // RouteAware
            'didPush', 'didPop', 'didPushNext', 'didPopNext',
            // Dart async patterns
            'then', 'catchError', 'whenComplete', 'asStream', 'timeout'
        ],
        isFrameworkMethod: isFlutterFrameworkMethod
    });
    
    // C# configuration
    supportedLanguages.set('csharp', {
        name: 'csharp',
        displayName: 'C#',
        fileExtensions: ['.cs'],
        filePatterns: ['**/*.cs'],
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
        filePatterns: ['**/*.py'],
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
        filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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
        vscode.window.showErrorMessage('No supported language detected in workspace. Make sure you have the appropriate language extension installed (Python, C#, TypeScript, or Dart).');
        return;
    }

    const langConfig = supportedLanguages.get(detectedLanguage)!;

    // Clear previous output and show the output channel
    outputChannel.clear();
    outputChannel.show();

    // Clear used names set and symbol mappings
    usedNames.clear();
    symbolMappings.clear();

    // Load existing mappings from symbols.json if it exists
    await loadExistingMappings();

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
    outputChannel.appendLine(`Symbol mappings saved to symbols.json`);
    vscode.window.showInformationMessage(`Obfuscation complete! Obfuscated ${totalRenamed} ${langConfig.displayName} symbols. Symbol mappings saved to symbols.json.`);
}

async function detectWorkspaceLanguage(): Promise<string | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;

    // Priority order: C# > Python > TypeScript > Dart
    const languagePriority = ['csharp', 'python', 'dart', 'typescript'];
    
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

function getExcludePatterns(language: string): string[] {
    switch (language) {
        case 'python':
            return ['__pycache__', '.venv', 'venv', 'site-packages', '.git'];
        case 'csharp':
            return ['bin', 'obj', 'packages', '.git'];
        case 'typescript':
            return ['node_modules', 'dist', 'build', '.git'];
        case 'dart':
            return ['.git'];
        default:
            return ['.git'];
    }
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

    // Filter out unwanted directories post-processing
    const excludePatterns = getExcludePatterns(langConfig.name);
    allFiles = allFiles.filter(file => {
        const relativePath = vscode.workspace.asRelativePath(file);
        return !excludePatterns.some(pattern => relativePath.includes(pattern));
    });

    const patternInfo = Object.entries(patternCounts)
        .map(([pattern, count]) => `${pattern}: ${count}`)
        .join(', ');
    
    outputChannel.appendLine(`Found ${allFiles.length} ${langConfig.displayName} files in ${folder.name} after filtering (${patternInfo})`);

    // Process files in parallel for better performance
    // Note: Symbol renaming within each file is still sequential for safety
    const CONCURRENCY_LIMIT = 5;  // Process up to 5 files at once
    let totalRenamed = 0;

    // Split files into batches to avoid overwhelming the language server
    for (let i = 0; i < allFiles.length; i += CONCURRENCY_LIMIT) {
        const batch = allFiles.slice(i, i + CONCURRENCY_LIMIT);
        const batchResults = await Promise.all(
            batch.map(fileUri => obfuscateFileSymbols(fileUri, langConfig))
        );
        totalRenamed += batchResults.reduce((sum, count) => sum + count, 0);

        // Progress update
        outputChannel.appendLine(`Progress: ${Math.min(i + CONCURRENCY_LIMIT, allFiles.length)}/${allFiles.length} files processed`);
    }

    return totalRenamed;
}

async function getDocumentSymbolsWithRetry(fileUri: vscode.Uri, languageId: string): Promise<vscode.DocumentSymbol[] | null> {
    const maxRetries = languageId === 'python' ? 3 : 1;
    const delay = languageId === 'python' ? 500 : 0;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) {
                outputChannel.appendLine(`    Retry attempt ${attempt}/${maxRetries} for ${languageId} symbols...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                fileUri
            );
            
            if (symbols && symbols.length > 0) {
                return symbols;
            }
            
            if (attempt === maxRetries) {
                return symbols; // Return whatever we got on final attempt
            }
        } catch (error) {
            outputChannel.appendLine(`    Error on attempt ${attempt}: ${error}`);
            if (attempt === maxRetries) {
                throw error;
            }
        }
    }
    
    return null;
}

async function obfuscateFileSymbols(fileUri: vscode.Uri, langConfig: LanguageConfig): Promise<number> {
    let renamedCount = 0;
    
    try {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const relativePath = vscode.workspace.asRelativePath(fileUri);
        
        outputChannel.appendLine(`\n--- File: ${relativePath} ---`);

        // Get document symbols with retry for Python
        outputChannel.appendLine(`  Requesting symbols for ${document.languageId} file...`);
        let symbols = await getDocumentSymbolsWithRetry(fileUri, document.languageId);

        outputChannel.appendLine(`  Symbol provider returned: ${symbols ? symbols.length : 'null'} symbols`);
        if (symbols && symbols.length > 0) {
            outputChannel.appendLine(`  Found symbols: ${symbols.map(s => `${s.name} (${vscode.SymbolKind[s.kind]})`).join(', ')}`);
            renamedCount = await obfuscateSymbols(symbols, fileUri, document, langConfig);
        } else {
            outputChannel.appendLine('  No symbols found - this might indicate a language server issue');
        }

    } catch (error) {
        outputChannel.appendLine(`Error processing ${fileUri.fsPath}: ${error}`);
    }

    return renamedCount;
}

// Dart reserved words and built-in identifiers that must never be renamed
const dartKeywords = [
    'required', 'abstract', 'as', 'assert', 'async', 'await', 'break',
    'case', 'catch', 'class', 'const', 'continue', 'covariant', 'default',
    'deferred', 'do', 'dynamic', 'else', 'enum', 'export', 'extends',
    'extension', 'external', 'factory', 'false', 'final', 'finally',
    'for', 'Function', 'get', 'hide', 'if', 'implements', 'import',
    'in', 'interface', 'is', 'late', 'library', 'mixin', 'new', 'null',
    'on', 'operator', 'part', 'rethrow', 'return', 'sealed', 'set',
    'show', 'static', 'super', 'switch', 'sync', 'this', 'throw',
    'true', 'try', 'typedef', 'var', 'void', 'when', 'while', 'with', 'yield',
];

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
            vscode.SymbolKind.EnumMember,
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

        // Skip symbols that were already obfuscated by a prior rename
        if (usedNames.has(symbol.name)) {
            outputChannel.appendLine(`  Skipping ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} (already obfuscated)`);
            continue;
        }

        // Use language-specific skip names and framework detection
        const isNonRenameableType = nonRenameableTypes.includes(symbol.kind);
        const isInSkipList = langConfig.skipNames.includes(symbol.name);
        const isFrameworkMethod = langConfig.isFrameworkMethod(symbol);
        const isLanguageKeyword = langConfig.name === 'dart' && dartKeywords.includes(symbol.name);

        const shouldSkip = isNonRenameableType || isInSkipList || isFrameworkMethod || isLanguageKeyword;

        if (shouldSkip) {
            // Provide specific reason for skipping
            let reason: string;
            if (isNonRenameableType) {
                reason = 'non-renameable type';
            } else if (isLanguageKeyword) {
                reason = 'language keyword';
            } else if (isInSkipList) {
                reason = `${langConfig.displayName} framework or built-in method`;
            } else if (isFrameworkMethod) {
                reason = `${langConfig.displayName} framework method pattern`;
            } else {
                reason = 'unknown reason';
            }

            outputChannel.appendLine(`  Skipping ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} (${reason})`);
        } else {
            // Check if this symbol already has a mapping from previous obfuscation
            let newName: string;
            if (symbolMappings.has(symbol.name)) {
                // Reuse existing mapping
                newName = symbolMappings.get(symbol.name)!;
                outputChannel.appendLine(`  Reusing mapping for ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} -> ${newName}`);
            } else {
                // Check if symbol is private (starts with underscore)
                const isPrivate = symbol.name.startsWith('_');

                // Generate new random obfuscated name
                newName = generateObfuscatedName(isPrivate);
                outputChannel.appendLine(`  Obfuscating ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} -> ${newName}`);
            }

            try {
                
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

    // If detail indicates this is an override, skip it
    if (symbol.detail && symbol.detail.includes('@override')) {
        return true;
    }

    // HTTP client methods that must keep their names
    const httpOverrideMethods = ['send', 'close', 'open', 'read', 'write', 'flush'];
    if (httpOverrideMethods.includes(name)) {
        return true;
    }

    // Override methods (typically start with specific patterns)
    // Note: parentheses around the `on*` check fix operator precedence bug
    if (name.startsWith('didChange') || name.startsWith('willChange') ||
        (name.startsWith('on') && name.length > 2 && name[2] === name[2].toUpperCase())) {
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

async function loadExistingMappings(): Promise<void> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        const symbolsFilePath = path.join(workspaceFolder.uri.fsPath, 'symbols.json');

        // Check if file exists
        try {
            await fs.promises.access(symbolsFilePath);
        } catch {
            // File doesn't exist, no existing mappings to load
            outputChannel.appendLine('No existing symbols.json found - starting fresh obfuscation');
            return;
        }

        // Read and parse the file
        const fileContent = await fs.promises.readFile(symbolsFilePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Load mappings into symbolMappings and usedNames
        if (data.mappings && typeof data.mappings === 'object') {
            for (const [originalName, obfuscatedName] of Object.entries(data.mappings)) {
                symbolMappings.set(originalName, obfuscatedName as string);
                usedNames.add(obfuscatedName as string);
            }
            outputChannel.appendLine(`Loaded ${symbolMappings.size} existing symbol mappings from symbols.json`);
        }

    } catch (error) {
        outputChannel.appendLine(`Warning: Failed to load existing mappings: ${error}`);
        // Continue with empty mappings
    }
}

function generateObfuscatedName(isPrivate: boolean = false): string {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let name: string;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
        // Generate random length between 3 and 12
        const length = Math.floor(Math.random() * 10) + 3;

        // Start with underscore for private symbols, otherwise a letter
        if (isPrivate) {
            name = '_' + letters.charAt(Math.floor(Math.random() * letters.length));
        } else {
            name = letters.charAt(Math.floor(Math.random() * letters.length));
        }

        // Add remaining characters (letters or numbers)
        const startIndex = isPrivate ? 2 : 1;  // Skip first 2 chars if private (_x), otherwise 1 (x)
        for (let i = startIndex; i < length; i++) {
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
            outputChannel.appendLine('No workspace folder found for symbols.json');
            return;
        }

        const symbolsFilePath = path.join(workspaceFolder.uri.fsPath, 'symbols.json');

        const langConfig = supportedLanguages.get(language)!;

        // Sort mappings alphabetically by original name for better readability
        const sortedMappings = Array.from(symbolMappings.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        // Create JSON structure
        const jsonOutput = {
            language: langConfig.displayName,
            languageId: language,
            generated: new Date().toISOString(),
            totalSymbols: sortedMappings.length,
            mappings: Object.fromEntries(sortedMappings)
        };

        // Write to file with pretty formatting
        const content = JSON.stringify(jsonOutput, null, 2);
        await fs.promises.writeFile(symbolsFilePath, content, 'utf8');
        outputChannel.appendLine(`Symbol mappings written to: ${symbolsFilePath}`);

    } catch (error) {
        outputChannel.appendLine(`Error writing symbols.json: ${error}`);
    }
}

export function deactivate() {}
