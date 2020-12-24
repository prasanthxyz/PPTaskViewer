// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "pptaskviewer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('pptaskviewer.viewTasks', function () {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let content = "";
            if (selection.start.line == selection.end.line && selection.start.character == selection.end.character) {
                content = document.getText();
            } else {
                content = document.getText(selection);
            }

            const dateRegex = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}/;
            const taskRegex = /\[\[([^\]]*)\]\]/;
            let lines = content.split(/\r?\n/).filter(line => line.length != 0);
            let currentDate = null;
            let taskMatch = null;
            let note = "";
            let task = "";
            let data = {};
            const unCategorized = "UNCATEGORIZED";

            for (var line in lines) {
                let currentLine = lines[line];
                if (dateRegex.test(currentLine)) {
                    currentDate = currentLine;
                    continue;
                }

                if (!currentDate) {
                    continue;
                }

                taskMatch = currentLine.match(taskRegex);
                if (!taskMatch) {
                    task = unCategorized;
                    note = currentLine.trim();
                } else {
                    task = taskMatch[1];
                    note = currentLine.replace(taskRegex, "").trim();
                }

                if (!(task in data)) {
                    data[task] = []
                }

                data[task].push([currentDate, note]);
            }

            var summary = "";
            let details = null;
            for (let task in data) {
                summary += task + "\n";
                details = data[task];
                for (let item in details) {
                    summary += details[item][0] + " " + details[item][1] + "\n";
                }
                summary += "\n";
            }

            vscode.workspace.openTextDocument({content: summary})
                .then(data => vscode.window.showTextDocument(data));
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
