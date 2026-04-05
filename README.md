# 🏙️ Skyline AA-1

**The Autonomous AI Software Architect.**

Skyline AA-1 converts natural language into production-ready code, validation logic, database schemas, and API routes. Powered by GPT-4o and built with a modular graph engine.

## 🚀 Features

- **Natural Language Processing:** Describe what you want in English.
- **Intent Recognition:** Automatically detects Login, Signup, Payment, etc.
- **Plan Decomposition:** Breaks complex requests ("Build a shop") into multiple files.
- **Context Memory:** Remembers your preferences (e.g., "Use PostgreSQL").
- **CLI Tool:** Generate code directly from your terminal.

## 🛠️ Installation

1. Clone the repository.
2. Install dependencies:
```bash
   npm install
```
3. Create a `.env` file and add your OpenAI API Key:
```env
   OPENAI_API_KEY=sk-proj-your-key-here
```

## 💻 CLI Usage

You can use Skyline directly from the command line!

**1. Generate Code:**
```bash
# Simple Logic
node cli.js generate "Check if age is over 18"

# Complex System (Multi-file)
node cli.js generate "Build a complete login system with PostgreSQL"
```

**2. Initialize Project:**
```bash
node cli.js init
```

**3. Clear Memory:**
```bash
node cli.js clear-memory
```

*(Optional) Install Globally:*
```bash
npm link
skyline generate "Make a calculator"
```

## 🌐 Web Interface

Start the web server:
```bash
npm start
```
Then open `http://localhost:5001` in your browser.

## 📅 Roadmap

- [x] Week 21: Natural Language Parser
- [x] Week 22: Intent Decoder & Blueprints
- [x] Week 23: Plan Decomposer (Multi-file)
- [x] Week 24: Context Memory
- [x] Week 25: CLI Tool
- [ ] Week 26: Visualizer
- ...
- [ ] Week 40: v1.0 Launch

## 🤝 Contributing

Built by Habeebullah (Ronalmess).

---
*Powered by OpenAI GPT-4o*
