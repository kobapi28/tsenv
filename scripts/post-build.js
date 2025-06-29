#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const cliPath = path.join(__dirname, "..", "dist", "cli.js");

// Read the file
let content = fs.readFileSync(cliPath, "utf8");

// Add shebang if it doesn't exist
if (!content.startsWith("#!/usr/bin/env node")) {
  content = `#!/usr/bin/env node\n${content}`;
  fs.writeFileSync(cliPath, content);

  // Make it executable
  fs.chmodSync(cliPath, 0o755);
}
