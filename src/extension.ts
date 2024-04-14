import * as vscode from "vscode";
import * as child_process from "child_process";

export function activate(context: vscode.ExtensionContext) {
  let isRunning = false;

  let restartDisposable = vscode.commands.registerCommand(
    "watson-cli.restart",
    () => {
      // The code to restart Watson should be placed here
      child_process.exec("watson restart", (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(error.message);
          return;
        }

        if (stderr) {
          vscode.window.showErrorMessage(stderr);
          return;
        }

        isRunning = true;
        vscode.window.showInformationMessage(stdout);
      });
    }
  );

  // Register stop command
  let stopDisposable = vscode.commands.registerCommand(
    "watson-cli.stop",
    () => {
      child_process.exec("watson stop", (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(error.message);
        }

        if (stderr) {
          vscode.window.showErrorMessage(stderr);
        }

        isRunning = false;
        vscode.window.showInformationMessage(stdout);
      });
    }
  );

  // Add commands to context subscriptions
  context.subscriptions.push(restartDisposable);
  context.subscriptions.push(stopDisposable);

  // Register show buttons command
  let toggleTimerDisposable = vscode.commands.registerCommand(
    "watson-cli.toggleTimer",
    () => {
      if (isRunning) {
        vscode.commands.executeCommand("watson-cli.stop");
      } else {
        vscode.commands.executeCommand("watson-cli.restart");
      }
      isRunning = !isRunning;
    }
  );

  // Add command to context subscriptions
  context.subscriptions.push(toggleTimerDisposable);

  let timerStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    101
  );
  timerStatusBarItem.command = "watson-cli.toggleTimer";

  // Function to update the timer
  function updateTimer() {
    child_process.exec(
      "watson report -dcG | grep 'Total:' | sed 's/Total: //'",
      (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(error.message);
          return;
        }
        if (stderr) {
          vscode.window.showErrorMessage(stderr);
          return;
        }
        timerStatusBarItem.text = `${
          isRunning ? " $(clock)" : " $(blokced)"
        } ${stdout.trim()}`;
      }
    );
  }

  // Update the timer initially and every second
  updateTimer();
  setInterval(updateTimer, 1000);

  timerStatusBarItem.show();

  // Add status bar item to context subscriptions
  context.subscriptions.push(timerStatusBarItem);
}

export function deactivate() {}
