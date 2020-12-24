// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('pptaskviewer.viewTasks', function () {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const content = editor.document.getText();

            const dateRegex = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}/;
            const taskRegex = /\[\[([^\]]*)\]\]/;

            let lines = content.split(/\r?\n/).filter(line => line.length != 0);
            let currentDate = null;
            let currentTask = null;
            let taskMatch = null;
            let data = {};

            for (var line in lines) {
                let currentLine = lines[line];

                // check for date
                if (dateRegex.test(currentLine)) {
                    currentDate = currentLine.trim();
                    currentTask = null;
                    continue;
                }
                // continue if no valid date had been found yet
                if (!currentDate) {
                    continue;
                }

                // check for task
                taskMatch = currentLine.match(taskRegex);
                if (taskMatch) {
                    currentTask = taskMatch[1];
                    continue;
                }
                // continue if no valid task had been found yet
                if (!currentTask) {
                    continue;
                }

                if (!(currentTask in data)) {
                    data[currentTask] = {};    
                }
                if (!(currentDate in data[currentTask])) {
                    data[currentTask][currentDate] = [];
                }

                data[currentTask][currentDate].push([currentLine]);
            }

            var summary = "Work Progress by Tasks\n======================\n\n";
            let details = null;
            for (let task in data) {
                summary += task + "\n";
                for (let date in data[task]) {
                    summary += "    " + date + "\n";
                    for (let noteI in data[task][date]) {
                        summary += data[task][date][noteI] + "\n";
                    }
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
