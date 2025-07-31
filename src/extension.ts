import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;
let usedNames = new Set<string>();

export async function activate(context: vscode.ExtensionContext) {
    // Create output channel for displaying results in user's VSCode
    outputChannel = vscode.window.createOutputChannel('Dart Code Obfuscator');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('Dart Code Obfuscator extension is now active!');

    let printDisposable = vscode.commands.registerCommand('dart-symbol-printer.printSymbols', async () => {
        await printAllDartSymbols();
    });

    let refactorDisposable = vscode.commands.registerCommand('dart-symbol-printer.refactorSymbols', async () => {
        await refactorAllDartSymbols();
    });

    context.subscriptions.push(printDisposable);
    context.subscriptions.push(refactorDisposable);

    // Auto-run when a Dart project is opened
    if (vscode.workspace.workspaceFolders) {
        await printAllDartSymbols();
    }
}

async function printAllDartSymbols() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    // Clear previous output and show the output channel
    outputChannel.clear();
    outputChannel.show();

    outputChannel.appendLine('=== DART SYMBOL PRINTER ===');
    outputChannel.appendLine('Starting symbol discovery...');

    for (const folder of workspaceFolders) {
        outputChannel.appendLine(`\nProcessing workspace: ${folder.name}`);
        await processWorkspaceFolder(folder, false);
    }

    outputChannel.appendLine('\n=== SYMBOL DISCOVERY COMPLETE ===');
    vscode.window.showInformationMessage('Dart symbols printed to Output panel (Dart Code Obfuscator)');
}

async function refactorAllDartSymbols() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    // Clear previous output and show the output channel
    outputChannel.clear();
    outputChannel.show();

    // Clear used names set for fresh obfuscation
    usedNames.clear();

    outputChannel.appendLine('=== DART CODE OBFUSCATION ===');
    outputChannel.appendLine('Starting symbol obfuscation...');
    outputChannel.appendLine('Renaming all renameable symbols with random names...');

    let totalRenamed = 0;

    for (const folder of workspaceFolders) {
        outputChannel.appendLine(`\nProcessing workspace: ${folder.name}`);
        const renamedCount = await processWorkspaceFolder(folder, true);
        totalRenamed += renamedCount;
    }

    outputChannel.appendLine(`\n=== OBFUSCATION COMPLETE ===`);
    outputChannel.appendLine(`Total symbols obfuscated: ${totalRenamed}`);
    vscode.window.showInformationMessage(`Obfuscation complete! Obfuscated ${totalRenamed} symbols. Check Output panel for details.`);
}

async function processWorkspaceFolder(folder: vscode.WorkspaceFolder, shouldRefactor: boolean): Promise<number> {
    const pattern = new vscode.RelativePattern(folder, '**/*.dart');
    const dartFiles = await vscode.workspace.findFiles(pattern);

    outputChannel.appendLine(`Found ${dartFiles.length} Dart files in ${folder.name}`);

    let totalRenamed = 0;

    for (const fileUri of dartFiles) {
        const renamedCount = await processFile(fileUri, shouldRefactor);
        totalRenamed += renamedCount;
    }

    return totalRenamed;
}

async function processFile(fileUri: vscode.Uri, shouldRefactor: boolean = false): Promise<number> {
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
            if (shouldRefactor) {
                renamedCount = await refactorSymbols(symbols, fileUri, document);
            } else {
                printSymbols(symbols, 0);
            }
        } else {
            outputChannel.appendLine('  No symbols found');
        }

    } catch (error) {
        outputChannel.appendLine(`Error processing ${fileUri.fsPath}: ${error}`);
    }

    return renamedCount;
}

async function refactorSymbols(symbols: vscode.DocumentSymbol[], fileUri: vscode.Uri, document: vscode.TextDocument): Promise<number> {
    let renamedCount = 0;
    
    // Process symbols in reverse order to avoid position shifts
    const sortedSymbols = [...symbols].sort((a, b) => b.range.start.line - a.range.start.line);
    
    for (const symbol of sortedSymbols) {
        // Recursively process child symbols first
        if (symbol.children && symbol.children.length > 0) {
            renamedCount += await refactorSymbols(symbol.children, fileUri, document);
        }
        
        // Skip symbol types that typically cannot be renamed
        const nonRenameableTypes = [
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
        const skipNames = ['main', 'toString', 'hashCode', 'operator==', 'runtimeType', 'noSuchMethod'];
        
        if (nonRenameableTypes.includes(symbol.kind) || skipNames.includes(symbol.name)) {
            outputChannel.appendLine(`  Skipping ${vscode.SymbolKind[symbol.kind]}: ${symbol.name} (non-renameable type or special symbol)`);
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

function printSymbols(symbols: vscode.DocumentSymbol[], indent: number) {
    const indentStr = '  '.repeat(indent);
    
    for (const symbol of symbols) {
        const kindStr = vscode.SymbolKind[symbol.kind];
        const range = `${symbol.range.start.line + 1}:${symbol.range.start.character + 1}-${symbol.range.end.line + 1}:${symbol.range.end.character + 1}`;
        
        outputChannel.appendLine(`${indentStr}${kindStr}: ${symbol.name} (${range})`);
        
        if (symbol.detail) {
            outputChannel.appendLine(`${indentStr}  Detail: ${symbol.detail}`);
        }

        // Recursively print child symbols
        if (symbol.children && symbol.children.length > 0) {
            printSymbols(symbol.children, indent + 1);
        }
    }
}

export function deactivate() {}