# 🛡️ GraphSentinel AI
### Real-Time Financial Fraud Detection System
> Built for HackTheCore 2025 — AI in Financial Security

---

## 🔥 What It Does

GraphSentinel AI is a **bank-grade fraud detection platform** used by fraud analysts, loan officers, and cybersecurity teams at financial institutions. It detects fraud in real-time across transactions using a hybrid AI + graph algorithm engine.

### 4 Fraud Detection Layers:
| Layer | What It Catches |
|---|---|
| 🔴 Rule Engine | High-value transactions, rapid bursts |
| 🕸️ Graph Engine | Circular transactions, layering, fan-out |
| 🧠 Behavior Engine | Smurfing, sleeper accounts, behavior drift |
| 🌍 Geo Engine | Cross-border anomalies, corridor evasion |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express |
| AI | Claude (Anthropic) — intelligent fraud chatbot |
| ML Model | TensorFlow.js — hybrid scoring |
| Streaming | Apache Kafka — real-time transaction processing |
| Database | MongoDB |
| Live Alerts | Socket.IO |
| Graph Viz | ReactFlow |

---

## ⚡ Quick Start

### 1. Clone & Setup Backend
```bash
cd Backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

### 2. Setup Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 3. Start Kafka + MongoDB
```bash
# MongoDB
mongod

# Kafka (requires Docker)
docker run -p 9092:9092 apache/kafka
```

### 4. Open the App
```
http://localhost:3000
```

---

## 🎬 Demo Mode

Click the **"Run Fraud Demo"** button on the Dashboard to simulate:
- 🔄 Circular transaction (money laundering): A1 → A2 → A3 → A1
- 💧 Smurfing: Multiple ₹9,000 transactions just below threshold
- 💥 High-value suspicious transfer: ₹1,20,000 single transaction

Watch the **Fund Flow Graph light up red** in real-time as fraud is detected!

---

## 📱 App Pages

| Page | Description |
|---|---|
| 🏠 Dashboard | Live stats, charts, AI chatbot, demo button |
| 💳 Transactions | All transactions with risk scores and filters |
| 🕸️ Fund Flow Graph | Interactive network graph of money movements |
| 🚨 Alerts | Full alert management — open, investigate, resolve |
| 🔍 Investigation | Deep-dive into any account with path tracer |
| 📊 Reports | Generate and print compliance reports |

---

## 🧠 AI Chatbot

The built-in GraphSentinel AI chatbot (powered by Claude) can answer:
- *"Why is this account flagged?"*
- *"What fraud pattern is this?"*
- *"What action should I take?"*
- *"Is this money laundering?"*

---

## 👥 Target Users

- 🏦 Bank fraud analysts
- 📋 Loan officers / KYC teams  
- 🔐 Cybersecurity / SOC teams

---

*Built with ❤️ for HackTheCore 2025*
