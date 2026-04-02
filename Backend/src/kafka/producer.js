import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "fraud-system",
  brokers: ["localhost:9092"],
});

let producer;

// ✅ START PRODUCER
export const startProducer = async () => {
  producer = kafka.producer();
  await producer.connect();
  console.log("✅ Kafka Producer Connected");
};

// ✅ SEND TRANSACTION
export const produceTransaction = async (transaction) => {
  if (!producer) {
    // Kafka is optional in local/demo mode.
    return;
  }

  try {
    await producer.send({
      topic: "transactions",
      messages: [{ value: JSON.stringify(transaction) }],
    });
    console.log("📤 Transaction sent:", transaction);
  } catch (error) {
    console.error("❌ Produce error:", error);
  }
};