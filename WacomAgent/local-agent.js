// local-agent.js
const express = require("express");
const cors = require('cors');
const { exec } = require("child_process");
const path = require("path");
const app = express();
const PORT = 5000; 

app.use(cors());
app.use(express.json());

// Endpoint to capture signature
app.post("/signature", async (req, res) => {
  try {
    const batPath = path.join(__dirname, "JScript", "Run-JS.bat");
    const jsFile = "CaptureImage_Binary.js";

    exec(`cmd /c "${batPath}" ${jsFile}`, { cwd: path.dirname(batPath) }, (error, stdout, stderr) => {
      if (error) return res.status(500).json({ error: error.message });
      if (stderr) console.error("stderr:", stderr);

      const dataUriIndex = stdout.indexOf("data:image");
      const base64Sig = dataUriIndex >= 0 ? stdout.substring(dataUriIndex) : "";
      const jsonData = JSON.stringify({ data: base64Sig });
      const sigObj = JSON.parse(jsonData);
      res.json({
        image: sigObj,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Wacom agent running at http://localhost:${PORT}`));
