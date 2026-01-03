import { spawn } from "child_process";

export async function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn("node", ["../server.js"], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    let responseData = "";
    mcpProcess.stdout.on("data", (data) => {
      responseData += data.toString();
    });

    mcpProcess.stderr.on("data", (data) => {
      console.error("MCP stderr:", data.toString());
    });

    mcpProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`MCP process exited with code ${code}`));
      } else {
        try {
          const response = JSON.parse(responseData.trim());
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(e);
        }
      }
    });

    mcpProcess.stdin.write(JSON.stringify(request) + "\n");
    mcpProcess.stdin.end();
  });
}