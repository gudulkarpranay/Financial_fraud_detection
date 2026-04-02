import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const chatWithSystem = async (req, res) => {
  const { message, transaction, account } = req.body;

  try {
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
      reply: `Analyzing transaction data. Detected patterns: ${
        (req.body.transaction?.reasons || []).join(", ") ||
        "suspicious behavioral anomalies detected"
      }. Please review manually.`,
      success: false,
    });
  }
};
