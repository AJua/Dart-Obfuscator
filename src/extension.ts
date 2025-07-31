import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext) {
    // Create output channel for displaying results in user's VSCode
    outputChannel = vscode.window.createOutputChannel('Dart Symbol Printer');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('Dart Symbol Printer extension is now active!');

    let disposable = vscode.commands.registerCommand('dart-symbol-printer.printSymbols', async () => {
        await printAllDartSymbols();
    });

    context.subscriptions.push(disposable);

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
        await processWorkspaceFolder(folder);
    }

    outputChannel.appendLine('\n=== SYMBOL DISCOVERY COMPLETE ===');
    vscode.window.showInformationMessage('Dart symbols printed to Output panel (Dart Symbol Printer)');
}

async function processWorkspaceFolder(folder: vscode.WorkspaceFolder) {
    const pattern = new vscode.RelativePattern(folder, '**/*.dart');
    const dartFiles = await vscode.workspace.findFiles(pattern);

    outputChannel.appendLine(`Found ${dartFiles.length} Dart files in ${folder.name}`);

    for (const fileUri of dartFiles) {
        await processFile(fileUri);
    }
}

async function processFile(fileUri: vscode.Uri) {
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
            printSymbols(symbols, 0);
        } else {
            outputChannel.appendLine('  No symbols found');
        }

    } catch (error) {
        outputChannel.appendLine(`Error processing ${fileUri.fsPath}: ${error}`);
    }
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