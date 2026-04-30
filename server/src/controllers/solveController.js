const path = require("path");
const { spawn } = require("child_process");

const solveScheduling = (req, res) => {
  const { tasks } = req.body || {};

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      error: "Request body must include a non-empty tasks array.",
    });
  }

  const pythonScriptPath = path.resolve(
    __dirname,
    "../../../python_core/weighted_interval.py"
  );

  const pythonProcess = spawn("python", [pythonScriptPath]);

  let stdout = "";
  let stderr = "";

  pythonProcess.stdin.write(JSON.stringify({ tasks }));
  pythonProcess.stdin.end();

  pythonProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: "Python solver process failed.",
        details: stderr || "Unknown Python process error.",
      });
    }

    try {
      const parsed = JSON.parse(stdout);

      if (parsed.error) {
        return res.status(400).json(parsed);
      }

      return res.json({
        message: "Task schedule solved successfully.",
        result: parsed,
      });
    } catch (err) {
      return res.status(500).json({
        error: "Invalid solver response.",
        details: err.message,
        raw: stdout,
      });
    }
  });
};

module.exports = { solveScheduling };
