import gemini from "../config/gemini.js";

const generateText = async (prompt) => {
    const response = await gemini.models.generateContent({
        model:
            process.env.GEMINI_MODEL ||
            "gemini-3.6-flash",

        contents: prompt,
    });

    return {
        text: response.text,
        usage: response.usageMetadata,
    };
};


// Generate structured JSON response
const generateStructuredOutput = async (
    prompt,
    responseSchema
) => {
    const response = await gemini.models.generateContent({
        model:
            process.env.GEMINI_MODEL ||
            "gemini-3.6-flash",

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    let parsedOutput;

    try {
        parsedOutput = JSON.parse(response.text);
    } catch (error) {
        throw new Error(
            "Gemini returned invalid JSON"
        );
    }

    return {
        output: parsedOutput,
        usage: response.usageMetadata,
    };
};

export {
    generateText,
    generateStructuredOutput,
};