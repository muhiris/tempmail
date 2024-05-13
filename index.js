#!/usr/bin/env node
import { OneSecMail } from "onesecmail";
import cheerio from "cheerio";

async function checkEmailsUntilTimeout(mailbox) {
  // Set timeout for 10 minutes
  const endTime = Date.now() + 10 * 60 * 1000;

  // Keep track of processed email IDs
  const processedEmailIds = new Set();

  while (Date.now() < endTime) {
    try {
      const messages = await mailbox.getMessages();

      for (const message of messages) {
        if (!processedEmailIds.has(message.id)) {
          // If the email has not been processed yet, fetch and process it
          const fullMessage = await message.fetchFullMessage();

          // Extract raw text content from HTML body
          const $ = cheerio.load(fullMessage.htmlBody);
          const textBody = $.root().text().trim();

          console.log({
            id: message.id,
            from: fullMessage.from,
            subject: fullMessage.subject,
            body: textBody,
            date: fullMessage.date,
            attachments: fullMessage.attachments,
            // textBody: fullMessage.textBody,
            // htmlBody: fullMessage.htmlBody,
          });

          // Add the email ID to the set of processed IDs
          processedEmailIds.add(message.id);
        }
      }

      // Wait for a period before checking again (e.g., every 5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error("Error:", error);
      // Retry logic or handle errors as needed
    }
  }

  console.log("10 minutes have passed. Stopping...");
}
// Function to generate a random string of characters
function generateRandomName(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let randomName = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomName += characters[randomIndex];
    }
    return randomName;
}


async function main() {
  try {
    const randomName = generateRandomName(4);
    const mailbox = await OneSecMail(randomName + "@1secmail.com");

    // const mailbox = await OneSecMail("muhiris@1secmail.com");
    console.log(`TempMail is: ${randomName}@1secmail.com`);

    await checkEmailsUntilTimeout(mailbox);

    // Clear messages after 10 minutes
    await mailbox.clearMessages();
    console.log("Messages cleared.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
