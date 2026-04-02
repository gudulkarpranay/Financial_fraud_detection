// Backend/src/kafka/alertConsumer.js

import { kafka } from "./kafkaClient.js";

const consumer = kafka.consumer({ groupId: "alert-group" });

export const startAlertConsumer = async () => {
  await consumer.connect();

  console.log("✅ Alert Consumer Connected");

  await consumer.subscribe({ topic: "fraud-alerts", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const alert = JSON.parse(message.value.toString());

      console.log("🚨 FRAUD ALERT:", alert);

      // 👉 Later: save to DB or send to frontend
    }
  });
};