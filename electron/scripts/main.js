import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 1280,
        webPreferences: {
            nodeIntegration: true,
            nativeWindowOpen: true,
        },
    });

    const server = express();
    const indexPath = app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked", "out")
        : path.join(__dirname, "../out");

    server.use(express.static(indexPath));

    const listener = server.listen(58583, () => {
        win.loadURL("http://localhost:58583", {userAgent: "Electron"});
    });

    app.on("window-all-closed", () => {
        listener.close();
        app.quit();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

