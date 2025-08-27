import { check, sleep } from "k6";
import http from "k6/http";

const TRANSACTION_BASE_URL = __ENV.TRANSACTION_URL || "http://localhost:3099";
const PAYMENT_BASE_URL = __ENV.PAYMENT_URL || "http://localhost:3100";
const SCENARIO = __ENV.SCENARIO || "";

function randomUsername() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `user_${rand}`;
}

const baseScenarios = {
  small: {
    executor: "constant-arrival-rate",
    rate: 50, // 50 requests per minute
    timeUnit: "1m",
    duration: "1m",
    preAllocatedVUs: 10,
    maxVUs: 50,
  },
  medium: {
    executor: "constant-arrival-rate",
    rate: 1000, // 1000 requests per minute
    timeUnit: "1m",
    duration: "1m",
    preAllocatedVUs: 50,
    maxVUs: 500,
    startTime: "1m",
  },
  large: {
    executor: "constant-arrival-rate",
    rate: 50000, // 50k requests per minute
    timeUnit: "1m",
    duration: "1m",
    preAllocatedVUs: 500,
    maxVUs: 5000,
    startTime: "2m",
  },
  xlarge: {
    executor: "constant-arrival-rate",
    rate: 1000000, // 1M requests per minute
    timeUnit: "1m",
    duration: "1m",
    preAllocatedVUs: 5000,
    maxVUs: 20000,
    startTime: "3m",
  },
};

function pickScenarios() {
  if (SCENARIO && baseScenarios[SCENARIO]) {
    return { [SCENARIO]: baseScenarios[SCENARIO] };
  }
  return baseScenarios;
}

export const options = { scenarios: pickScenarios() };

export default function () {
  const buyerName = randomUsername();

  const buyRes = http.post(
    `${TRANSACTION_BASE_URL}/buy`,
    JSON.stringify({ buyerName }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: "30s",
    },
  );

  check(buyRes, {
    "buy status 200": (r) => r.status === 200,
  });

  if (buyRes.status === 200) {
    try {
      const payload = buyRes.json();
      const state = payload?.state;
      const transactionId = payload?.transactionId;

      // Only attempt payment if placed into payment queue; 85% proceed to pay
      if (state === "payment" && transactionId && Math.random() < 0.85) {
        const payRes = http.post(
          `${PAYMENT_BASE_URL}/pay`,
          JSON.stringify({ transactionId, quantity: 1 }),
          { headers: { "Content-Type": "application/json" }, timeout: "30s" },
        );

        check(payRes, {
          "pay status 200": (r) => r.status === 200,
        });
      }
    } catch (_e) {
      // ignore json parse errors for failed responses
    }
  }

  sleep(0.1);
}
