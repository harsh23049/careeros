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

export {
    generateText,
};