// Backend/src/kafka/consumer.js

import { kafka } from "./kafkaClient.js";
import { analyzeTransaction } from "../services/fraudDetectionService.js";

const consumer = kafka.consumer({ groupId: "fraud-group" });
const producer = kafka.producer();

let transactionCache = [];

export const startConsumer = async () => {
  await consumer.connect();
  await producer.connect();

  console.log("✅ Kafka Consumer Connected");

  await consumer.subscribe({ topic: "transactions", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const tx = JSON.parse(message.value.toString());

      transactionCache.push(tx);

      const result = await analyzeTransaction(tx, transactionCache);

      console.log("🔥 Fraud Result:", result);

      if (result.riskScore > 40) {
        await producer.send({
          topic: "fraud-alerts",
          messages: [
            {
              value: JSON.stringify({
                tx,
                result
              })
            }
          ]
        });
      }
    }
  });
};