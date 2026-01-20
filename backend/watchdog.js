const transporter = require("./mailer");

const SERVER_URL = "http://localhost:5500/heartbeat";
const CHECK_INTERVAL = 10000;
const TIMEOUT = 5000;

let serverState = "UP";
let mailFlag = 0;

async function checkServer() {
  const fetch = (await import("node-fetch")).default;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(SERVER_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error("Server unhealthy");

    // Server is UP
    if (serverState === "DOWN") {
      console.log("✅ Server is back online");
      serverState = "UP";
      mailFlag = 0; // reset flag for next downtime
    } else {
      console.log("✅ Server is running");
    }

  } catch (error) {
    clearTimeout(timeout);

    // Send mail only once per downtime
    if (mailFlag === 0) {
      serverState = "DOWN"; // set DOWN **before sending mail**
      mailFlag = 1;          // mark mail as sent
      console.log("❌ Server down — sending email");

      try {
        await transporter.sendMail({
          from: "alert@yjktechnologies.com",
          to: "pavun.vj@yjktechnologies.com",
          subject: "🚨 Backend Server Down",
          text: `The backend server on port 5500 is not responding.\n\nError: ${error.message}`
        });
        console.log("📧 Mail sent to manager!");
      } catch (mailError) {
        console.error("❌ Failed to send email:", mailError);
      }

    } else {
      console.log("❌ Server still down — no email sent");
    }
  }
}

setInterval(checkServer, CHECK_INTERVAL);
