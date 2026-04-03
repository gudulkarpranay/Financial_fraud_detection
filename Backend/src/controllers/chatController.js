import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const formatINR = (n = 0) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const getGeneralReply = (message = "") => {
  const q = message.toLowerCase();

  if (q.includes("smurf")) {
    return "Smurfing means splitting money into many small transfers (often below reporting thresholds) to avoid detection. Action: cluster transactions by sender, 5-15 minute windows, and repeated amounts like ₹8,500-₹9,900.";
  }
  if (q.includes("circular")) {
    return "Circular transaction means funds move in a loop (A→B→C→A). This is a laundering signal because ownership looks changed but money returns to origin. Action: freeze high-risk hops, verify linked beneficiaries, and review graph path timestamps.";
  }
  if (q.includes("risk score") || q.includes("90")) {
    return "If risk score is around 90, treat it as critical. Recommended: temporarily block outgoing transfers, trigger step-up KYC, investigate linked accounts, and escalate for AML review with SAR documentation.";
  }

  return "I can help with fraud patterns like smurfing, circular flow, fan-out, velocity, and dormant activation. Ask me what pattern you want to understand and I will give detection logic + action plan.";
};

const getAccountReply = (message = "", account = null) => {
  const q = message.toLowerCase();
  const id = account?.id || "this account";
  const name = account?.name || "the account";
  const risk = Number(account?.riskScore || 0);
  const suspicious = Boolean(account?.isSuspicious);
  const fraudType = account?.fraudType ? String(account.fraudType).replace(/_/g, " ") : null;
  const country = account?.country || "IN";

  if (q.includes("why") || q.includes("suspicious")) {
    return `${id} (${name}) is ${suspicious ? "currently flagged suspicious" : "currently marked low risk"} with risk score ${risk}/100. ${fraudType ? `Detected pattern: ${fraudType}. ` : ""}${country !== "IN" ? `Country/jurisdiction (${country}) also increases risk. ` : ""}Check linked transfers, beneficiary concentration, and sudden amount spikes.`;
  }
  if (q.includes("money laundering") || q.includes("laundering")) {
    return `${id}: possible laundering indicators are ${fraudType || "anomaly patterns"}, layered hops, and fast beneficiary spread. Confidence is higher when loop paths, structuring amounts, or offshore links appear together.`;
  }
  if (q.includes("action") || q.includes("what should i do")) {
    return `Recommended actions for ${id}: 1) hold high-value outgoing transfers, 2) run enhanced KYC and device/IP review, 3) inspect last 24h linked accounts, 4) escalate if risk stays above 75.`;
  }

  return `For ${id}, I can explain why risk is ${risk}/100, whether behavior indicates laundering, and the next operational steps.`;
};

const localFallbackReply = ({ message, transaction, account }) => {
  if (account) {
    return getAccountReply(message, account);
  }
  if (transaction) {
    const from = transaction.fromAccount || transaction.from || "N/A";
    const to = transaction.toAccount || transaction.to || "N/A";
    const amount = formatINR(transaction.amount || 0);
    const score = Number(transaction.riskScore || 0);
    return `Transaction ${from} → ${to} (${amount}) has risk ${score}/100. Focus on velocity, beneficiary spread, and whether amount deviates from account baseline.`;
  }
  return getGeneralReply(message);
};

export const chatWithSystem = async (req, res) => {
  const { message, transaction, account } = req.body;

  try {
    // If key is missing, return local context-aware response instead of fixed repeated text.
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({
        reply: localFallbackReply({ message, transaction, account }),
        success: true,
        source: "local-fallback",
      });
    }

    const contextParts = [];

    if (transaction) {
      contextParts.push(`
TRANSACTION UNDER REVIEW:
- Transaction ID: ${transaction.id || "N/A"}
- From Account: ${transaction.fromAccount || transaction.from || "N/A"}
- To Account: ${transaction.toAccount || transaction.to || "N/A"}
- Amount: ₹${(transaction.amount || 0).toLocaleString("en-IN")}
- Risk Score: ${transaction.riskScore || 0}/100
- Alert Level: ${transaction.alertLevel || "N/A"}
- Fraud Reasons Detected: ${(transaction.reasons || []).join(", ") || "None"}
- Timestamp: ${transaction.timestamp || "N/A"}
      `.trim());
    }

    if (account) {
      contextParts.push(`
ACCOUNT PROFILE:
- Account ID: ${account.id || "N/A"}
- Account Name: ${account.name || "N/A"}
- Type: ${account.type || "N/A"}
- Country: ${account.country || "N/A"}
- Balance: ₹${(account.balance || 0).toLocaleString("en-IN")}
- Risk Score: ${account.riskScore || 0}/100
- Suspicious: ${account.isSuspicious ? "Yes" : "No"}
- Transaction Count: ${account.transactionCount || 0}
      `.trim());
    }

    const systemPrompt = `You are GraphSentinel AI, an expert financial fraud detection analyst embedded in a real-time fraud detection system used by Indian banks and fintech companies.

You have deep expertise in:
- AML (Anti-Money Laundering) patterns
- Indian financial fraud (UPI fraud, KYC fraud, loan fraud, account takeover)
- Graph-based fraud detection (circular transactions, layering, smurfing, fan-out)
- RBI compliance and Indian banking regulations
- Behavioral anomaly detection

${contextParts.length > 0 ? `CURRENT CONTEXT:\n${contextParts.join("\n\n")}` : ""}

When answering:
- Be direct, concise, and actionable
- Use Indian financial context (rupees, UPI, NEFT, RTGS, RBI, etc.)
- Explain fraud patterns in simple terms the analyst can act on
- Give clear recommended actions
- Keep responses under 150 words unless a detailed explanation is needed`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const reply = response.content[0]?.text || "Unable to process your query.";
    res.json({ reply, success: true });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.json({
      reply: localFallbackReply({ message, transaction, account }),
      success: false,
      source: "local-fallback",
    });
  }
};
