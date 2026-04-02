// Backend/src/kafka/kafkaClient.js

import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "graphsentinel-lite",
  brokers: ["localhost:9092"]
});