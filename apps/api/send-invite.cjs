const { Resend } = require("resend");

const email = process.argv[2];
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("Error: RESEND_API_KEY required");
  process.exit(1);
}

if (!email || !email.includes("@")) {
  console.error("Error: valid email required");
  process.exit(1);
}

const resend = new Resend(apiKey);

resend.emails
  .send({
    from: "Billwave <no-reply@mail.billwave.example>",
    to: email,
    subject: "Welcome to Billwave private beta",
    html: `
      <div style="background:#fafaf5;padding:48px 24px;font-family:system-ui,sans-serif;color:#1a1a1a;">
          <div style="max-width:480px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e0d9cc;border-radius:12px;box-shadow:6px 6px 0 0 #e0d9cc;">
            <p>Hey Daisuke,</p>
            <p>Thanks for joining Billwave beta!</p>
            <p>
              <a href="https://app.billwave.example/join/9aaae255-9979-45b1-b2f4-ccbc2596565a" style="color:#c07515;text-decoration:underline;">
                Get started here
              </a>
            </p>
            <p style="color:#3d3d3d;margin-top:24px;">
              Feel free to join our Discord community if you want to hang out or ask questions.
            </p>
            <p>
              <a href="https://discord.gg/9YGpHeBX2" style="color:#c07515;text-decoration:underline;">
                Join Discord
              </a>
            </p>
          </div>
      </div>
  `,
    text: "Hey,\n\nThanks for joining Billwave beta!\n\nGet started: https://app.billwave.example/join/9aaae255-9979-45b1-b2f4-ccbc2596565a\n\nFeel free to join our Discord community if you want to hang out or ask questions:\nhttps://discord.gg/9YGpHeBX2",
  })
  .then(({ data, error }) => {
    if (error) {
      console.error("Failed:", error);
      process.exit(1);
    }
    console.log("Sent to", email);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
