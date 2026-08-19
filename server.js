
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

//socket
const net = require("net");
const http = require("http");
const { sendVizCommand } = require("./services/command");
const mseRoutes = require("./mseservice/routes");


const app = express();
const port = 3000;

const BASE_DIR = "K:";//====================
const BASE_DIR_FLOWICS = "B:/Flowics";//====


// bypass cors
app.use(cors());
app.use(express.json());
app.use(express.text());

//app.use("/datareader/flowics", express.static(BASE_DIR_FLOWICS));//========
//app.use("/datareader/viz", express.static(BASE_DIR));//====================
app.use(['/datareader/flowics','/flowics'], express.static(BASE_DIR_FLOWICS));//========
app.use(['/datareader/viz','/viz'], express.static(BASE_DIR));//====================

// Middleware for statis file (project)
app.use('/html_library', express.static(path.join(__dirname, 'html_library')));
// Middleware for statis file
app.use('/files', express.static(BASE_DIR));
// Middleware for statis file (*.txt)
app.use('/txt', express.static('K:/CDD/TEMP/TXT'));
// Middleware for statis file (*.xml)
app.use('/flowics_ajm', express.static('B:/Flowics'));

//app.use("/mse", mseRoutes);
app.use("/api", mseRoutes);

// Main Route
app.get('/', (req, res) => {
  res.send('Hello, This server for Pilot Edge Test!');
});

app.get("/mse", (req, res) => {
  res.sendFile(path.join(__dirname, "html_files/index-horizontal.html"));
});

app.use("/layouts",express.static(path.join(__dirname, "html_files/layouts")));

//endpoint for *.txt file path
app.get('/get-txt-files', (req, res) => {
  const folderPath = 'K:/CDD/TEMP/TXT';
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading the directory');
    }

    // Filter only for *.txt file 
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    res.json(txtFiles);
  });
});

//endpoint for *.xml file path
app.get('/get-xml-files', (req, res) => {
  const folderPath = 'B:/Flowics';
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading the directory');
    }

    // Filter only for *.txt file 
    const xmlFiles = files.filter(file => file.endsWith('.xml'));
    res.json(xmlFiles);
  });
});


/* ================================================================== */

//endpoint for get list in the folder K:/CDD or BASE_DIR
app.get("/list", (req, res) => {
  try {
    const relPath = req.query.path || "";
    const type = req.query.type || "folder";

    const dir = path.join(BASE_DIR, relPath);

    const resolvedBase = path.resolve(BASE_DIR);
    const resolvedDir = path.resolve(dir);

    if (!resolvedDir.startsWith(resolvedBase)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    let result;

    if (type === "file") {
      result = items
        .filter(i => i.isFile())
        .map(i => i.name);
    } else {
      result = items
        .filter(i => i.isDirectory())
        .map(i => i.name);
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//write utf8
app.post("/write", (req, res) => {
  try {
    const { fileName, content } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName required" });
    }

    const fullPath = path.join(BASE_DIR, fileName);
    if (!path.resolve(fullPath).startsWith(path.resolve(BASE_DIR))) {
      return res.status(403).json({ error: "Access denied" });
    }
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content || "", "utf8");
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//read utf8??
app.post("/read", (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName required" });
    }
    const fullPath = path.join(BASE_DIR, fileName);
    if (!path.resolve(fullPath).startsWith(path.resolve(BASE_DIR))) {
      return res.status(403).json({ error: "Access denied" });
    }
    const content = fs.readFileSync(fullPath, "utf8");
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* ================================================================== */

/* ======================  VIZ COMMAND  ============================= */

app.get("/vizsend", async (req, res) => {
  const { host, port, cmd } = req.query;
  if (!host || !port || !cmd) {
    return res.json({ ok: false, error: "MISSING_PARAM" });
  }
  try {
    const response = await sendVizCommand(
      host,
      port,
      decodeURIComponent(cmd)
    );
    res.json({ ok: true, response });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

/* ================================================================== */

/* ======================  DATA READER  ============================= */

function createList(route, baseDir) {
  // ROOT LIST 
  app.get(`/${route}/list`, (req, res) => {
    handleList("", req, res, baseDir, route);
  });
  // SUBFOLDER LIST 
  app.get(`/${route}/list/*`, (req, res) => {
    handleList(req.params[0] || "", req, res, baseDir, route);
  });
}

function handleList(sub, req, res, baseDir, route) {

  const ext = req.query.ext;
  const target = path.join(baseDir, sub);
  if (!path.resolve(target).startsWith(path.resolve(baseDir))) {
    return res.status(403).json({ error: "Access denied" });
  }
  fs.readdir(target, { withFileTypes: true }, (err, items) => {
    if (err) return res.status(404).json({ error: "Folder not found" });
    let result = items.map(i => ({
      name: i.name,
      type: i.isDirectory() ? "folder" : "file",
      url: i.isDirectory()
        ? `/list/${sub ? sub + "/" : ""}${i.name}`
        : `/${sub ? sub + "/" : ""}${i.name}`


        //? `/${route}/list/${sub ? sub + "/" : ""}${i.name}`
        //: `/${route}/${sub ? sub + "/" : ""}${i.name}`
    }));
    if (ext) {
      result = result.filter(r =>
        r.type === "file" && r.name.endsWith(ext)
      );
    }
    res.json(result);
  });
}

function createWrite(route, baseDir) {
  app.post(`/${route}/write`, (req, res) => {
    
    const { filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: "filePath required" });
    const full = path.join(baseDir, filePath);
    if (!path.resolve(full).startsWith(path.resolve(baseDir))) {
      return res.status(403).json({ error: "Access denied" });
    }
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFile(full, content || "", "utf8", err => {
      if (err) return res.status(500).json({ error: "Write failed" });
      res.json({ success: true });
    });
  });
}
createList("flowics", BASE_DIR_FLOWICS);
createList("viz", BASE_DIR);

createWrite("flowics", BASE_DIR_FLOWICS);
createWrite("viz", BASE_DIR);
/* ================================================================== */

// Running server
app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
