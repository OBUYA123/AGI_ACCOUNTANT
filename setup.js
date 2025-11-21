#!/usr/bin/env node

/**
 * Quick Start Script for Smart AGI Accountant Platform
 * Run this after cloning the repository to set up both backend and frontend
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const execCommand = (command, cwd) => {
  try {
    log(`\n→ Executing: ${command}`, "blue");
    execSync(command, { cwd, stdio: "inherit" });
    return true;
  } catch (error) {
    log(`✗ Error executing: ${command}`, "red");
    return false;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  log(
    "\n╔══════════════════════════════════════════════════════════╗",
    "bright"
  );
  log("║   Smart AGI Accountant Platform - Quick Setup Script   ║", "bright");
  log(
    "╚══════════════════════════════════════════════════════════╝\n",
    "bright"
  );

  try {
    // Step 1: Check Node.js version
    log("Step 1/6: Checking Node.js version...", "yellow");
    const nodeVersion = process.version;
    log(`✓ Node.js version: ${nodeVersion}`, "green");
    if (parseInt(nodeVersion.slice(1).split(".")[0]) < 18) {
      log("✗ Node.js 18+ required!", "red");
      process.exit(1);
    }

    // Step 2: Setup Backend
    log("\nStep 2/6: Setting up Backend...", "yellow");
    const backendPath = path.join(__dirname, "backend");

    if (!execCommand("npm install", backendPath)) {
      log("✗ Backend installation failed", "red");
      process.exit(1);
    }

    // Check if .env exists
    const envPath = path.join(backendPath, ".env");
    const envExamplePath = path.join(backendPath, ".env.example");

    if (!fs.existsSync(envPath)) {
      log("\n⚠ .env file not found. Creating from .env.example...", "yellow");
      fs.copyFileSync(envExamplePath, envPath);
      log(
        "✓ .env file created. Please update with your actual values!",
        "green"
      );

      const shouldOpenEnv = await question(
        "\nWould you like to configure .env now? (y/n): "
      );

      if (shouldOpenEnv.toLowerCase() === "y") {
        log("\n📝 Please update the following in your .env file:", "blue");
        log("   - MONGODB_URI: Your MongoDB Atlas connection string", "blue");
        log("   - JWT_SECRET: A strong secret (min 32 characters)", "blue");
        log("   - OPENAI_API_KEY: Your OpenAI API key", "blue");
        log("   - Email settings (SMTP)", "blue");
        log("   - Payment credentials (M-Pesa, PayPal)", "blue");
        log("\nPress Enter when done editing...", "yellow");
        await question("");
      }
    } else {
      log("✓ .env file already exists", "green");
    }

    // Step 3: Build Backend
    log("\nStep 3/6: Building Backend...", "yellow");
    if (!execCommand("npm run build", backendPath)) {
      log("✗ Backend build failed", "red");
      process.exit(1);
    }
    log("✓ Backend built successfully", "green");

    // Step 4: Setup Frontend
    log("\nStep 4/6: Setting up Frontend...", "yellow");
    const frontendPath = path.join(__dirname, "frontend");

    if (!execCommand("npm install", frontendPath)) {
      log("✗ Frontend installation failed", "red");
      process.exit(1);
    }

    // Check if .env.local exists
    const frontendEnvPath = path.join(frontendPath, ".env.local");
    if (!fs.existsSync(frontendEnvPath)) {
      log("\n⚠ Creating .env.local for frontend...", "yellow");
      const frontendEnv = `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters`;
      fs.writeFileSync(frontendEnvPath, frontendEnv);
      log("✓ .env.local created for frontend", "green");
    } else {
      log("✓ .env.local already exists", "green");
    }
    log("✓ Frontend setup complete", "green");

    // Step 5: Summary
    log(
      "\n╔══════════════════════════════════════════════════════════╗",
      "bright"
    );
    log(
      "║                   Setup Complete! 🎉                    ║",
      "bright"
    );
    log(
      "╚══════════════════════════════════════════════════════════╝\n",
      "bright"
    );

    log("Next Steps:", "yellow");
    log("\n1. Start Backend (Terminal 1):", "blue");
    log("   cd backend", "bright");
    log("   npm run dev", "bright");
    log("   → Server will run on http://localhost:5000", "green");

    log("\n2. Start Frontend (Terminal 2):", "blue");
    log("   cd frontend", "bright");
    log("   npm run dev", "bright");
    log("   → App will run on http://localhost:3000", "green");

    log("\n3. Default Accounts:", "blue");
    log(
      "   Super Admin: superadmin@agiaccountant.com / SuperAdmin#2025!Secure",
      "bright"
    );
    log(
      "   Test Student: teststudent@agiaccountant.com / TestStudent#2025",
      "bright"
    );

    log("\n4. Documentation:", "blue");
    log("   - README.md - Project overview", "bright");
    log("   - INSTALLATION.md - Detailed setup guide", "bright");
    log("   - DEPLOYMENT.md - Production deployment guide", "bright");

    log("\n5. API Documentation:", "blue");
    log("   Once backend is running, visit:", "bright");
    log("   http://localhost:5000/api-docs", "green");

    log("\n⚠ Important:", "yellow");
    log("   - Update .env files with your actual credentials", "red");
    log("   - Never commit .env files to version control", "red");
    log("   - Enable 2FA for super admin account", "red");

    const shouldStartNow = await question(
      "\nWould you like to start the development servers now? (y/n): "
    );

    if (shouldStartNow.toLowerCase() === "y") {
      log("\n🚀 Starting development servers...", "yellow");
      log("Backend: http://localhost:5000", "green");
      log("Frontend: http://localhost:3000", "green");
      log("\nPress Ctrl+C to stop the servers\n", "yellow");

      // Start backend in background
      const { spawn } = require("child_process");
      const backend = spawn("npm", ["run", "dev"], {
        cwd: backendPath,
        stdio: "inherit",
        shell: true,
      });

      // Wait a bit for backend to start
      await sleep(3000);

      // Start frontend
      const frontend = spawn("npm", ["run", "dev"], {
        cwd: frontendPath,
        stdio: "inherit",
        shell: true,
      });

      // Handle cleanup
      process.on("SIGINT", () => {
        log("\n\n👋 Shutting down servers...", "yellow");
        backend.kill();
        frontend.kill();
        process.exit(0);
      });
    } else {
      log(
        "\n✓ Setup complete. Start the servers manually when ready!",
        "green"
      );
      rl.close();
      process.exit(0);
    }
  } catch (error) {
    log(`\n✗ Setup failed: ${error.message}`, "red");
    rl.close();
    process.exit(1);
  }
})();
