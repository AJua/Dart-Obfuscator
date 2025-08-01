import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let outputChannel: vscode.OutputChannel;
let usedNames = new Set<string>();
let symbolMappings = new Map<string, string>();

export async function activate(context: vscode.ExtensionContext) {
    // Create output channel for displaying results in user's VSCode
    outputChannel = vscode.window.createOutputChannel('Dart Obfuscator');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('Dart Obfuscator extension is now active!');

    let obfuscateDisposable = vscode.commands.registerCommand('dart-obfuscator.obfuscateCode', async () => {
        await obfuscateDartCode();
    });

    context.subscriptions.push(obfuscateDisposable);
}


async function obfuscateDartCode() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    // Clear previous output and show the output channel
    outputChannel.clear();
    outputChannel.show();

    // Clear used names set and symbol mappings for fresh obfuscation
    usedNames.clear();
    symbolMappings.clear();

    outputChannel.appendLine('=== DART CODE OBFUSCATION ===');
    outputChannel.appendLine('Starting symbol obfuscation...');
    outputChannel.appendLine('Renaming all renameable symbols with random names...');

    let totalRenamed = 0;

    for (const folder of workspaceFolders) {
        outputChannel.appendLine(`\nProcessing workspace: ${folder.name}`);
        const renamedCount = await processWorkspaceForObfuscation(folder);
        totalRenamed += renamedCount;
    }

    // Write symbols mapping to file
    if (symbolMappings.size > 0) {
        await writeSymbolsFile();
    }

    outputChannel.appendLine(`\n=== OBFUSCATION COMPLETE ===`);
    outputChannel.appendLine(`Total symbols obfuscated: ${totalRenamed}`);
    outputChannel.appendLine(`Symbol mappings saved to symbols.txt`);
    vscode.window.showInformationMessage(`Obfuscation complete! Obfuscated ${totalRenamed} symbols. Symbol mappings saved to symbols.txt.`);
}

async function processWorkspaceForObfuscation(folder: vscode.WorkspaceFolder): Promise<number> {
    // Only process files in /lib and /test folders to speed up obfuscation
    const libPattern = new vscode.RelativePattern(folder, 'lib/**/*.dart');
    const testPattern = new vscode.RelativePattern(folder, 'test/**/*.dart');
    
    const libFiles = await vscode.workspace.findFiles(libPattern);
    const testFiles = await vscode.workspace.findFiles(testPattern);
    const dartFiles = [...libFiles, ...testFiles];

    outputChannel.appendLine(`Found ${dartFiles.length} Dart files in ${folder.name} (/lib: ${libFiles.length}, /test: ${testFiles.length})`);

    let totalRenamed = 0;

    for (const fileUri of dartFiles) {
        const renamedCount = await obfuscateFileSymbols(fileUri);
        totalRenamed += renamedCount;
    }

    return totalRenamed;
}

async function obfuscateFileSymbols(fileUri: vscode.Uri): Promise<number> {
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
            renamedCount = await obfuscateSymbols(symbols, fileUri, document);
        } else {
            outputChannel.appendLine('  No symbols found');
        }

    } catch (error) {
        outputChannel.appendLine(`Error processing ${fileUri.fsPath}: ${error}`);
    }

    return renamedCount;
}

async function obfuscateSymbols(symbols: vscode.DocumentSymbol[], fileUri: vscode.Uri, document: vscode.TextDocument): Promise<number> {
    let renamedCount = 0;
    
    // Process symbols in reverse order to avoid position shifts
    const sortedSymbols = [...symbols].sort((a, b) => b.range.start.line - a.range.start.line);
    
    for (const symbol of sortedSymbols) {
        // Recursively process child symbols first
        if (symbol.children && symbol.children.length > 0) {
            renamedCount += await obfuscateSymbols(symbol.children, fileUri, document);
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

        // Skip built-in or special symbols that shouldn't be renamed
        const skipNames = [
            // Dart built-ins
            'main', 'toString', 'hashCode', 'operator==', 'runtimeType', 'noSuchMethod',
            
            // Flutter Widget lifecycle methods
            'build', 'initState', 'dispose', 'didChangeDependencies', 'didUpdateWidget',
            'deactivate', 'activate', 'didChangeAppLifecycleState', 'didHaveMemoryPressure',
            'didChangeAccessibilityFeatures', 'didChangeTextScaleFactor', 'didChangeLocales',
            'didChangePlatformBrightness', 'didChangeMetrics', 'createState',

            // Flutter CustomPaint overide method
            'paint', 'shouldRepaint',

            // Equatable overide
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
            'addListener', 'removeListener', 'notifyListeners', 'hasListeners',
            'clear', 'text', 'selection', 'value',
            
            // Flutter navigation methods
            'push', 'pop', 'pushReplacement', 'pushNamed', 'popUntil', 'canPop',
            
            // Flutter theme and localization
            'of', 'maybeOf', 'localizationsDelegates', 'supportedLocales',
            
            // Common Flutter patterns
            'copyWith', 'lerp', 'resolve', 'createTween', 'transform'
        ];
        
        // Check for Flutter framework methods and patterns
        const shouldSkip = nonRenameableTypes.includes(symbol.kind) || 
                          skipNames.includes(symbol.name) ||
                          isFlutterFrameworkMethod(symbol);
        
        
        if (shouldSkip) {
            outputChannel.appendLine(`  Skipping ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} (Flutter framework or built-in method)`);
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

async function writeSymbolsFile(): Promise<void> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            outputChannel.appendLine('No workspace folder found for symbols.txt');
            return;
        }

        const symbolsFilePath = path.join(workspaceFolder.uri.fsPath, 'symbols.txt');
        
        // Create content with original -> obfuscated mappings
        let content = '# Symbol Obfuscation Mappings\n';
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
