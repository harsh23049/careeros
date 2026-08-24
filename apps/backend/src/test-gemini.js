import dotenv from "dotenv";

dotenv.config();

console.log(
    "Gemini key loaded:",
    Boolean(process.env.GEMINI_API_KEY)
);

const { generateText } =
    await import("./services/gemini.service.js");

const result = await generateText(
    "tell me about your self"
);

console.log(result.text);