import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export class GeminiService {
  /**
   * Scores a student's speaking transcript against IELTS criteria using Gemini API.
   * 
   * @param transcript The transcription of the student's audio
   * @param prompt (Optional) The original question/prompt the student was responding to
   * @returns Structured JSON containing band scores and feedback
   */
  static async scoreSpeaking(transcript: string, prompt?: string) {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("Transcript is empty");
    }

    // Using gemini-1.5-flash for <7s end-to-end performance optimization
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert IELTS examiner. You are evaluating a student's speaking response based on the transcribed text.
${prompt ? `The examiner's question was: "${prompt}"` : ''}

Please evaluate the student's response strictly on the following 4 IELTS speaking criteria:
1. Fluency and Coherence (0.0 - 9.0)
2. Lexical Resource (0.0 - 9.0)
3. Grammatical Range and Accuracy (0.0 - 9.0)
4. Pronunciation (0.0 - 9.0) - Estimate based on typical errors matching the grammar/lexical level.

You must return the result STRICTLY as a valid JSON object without any markdown wrapping (no \`\`\`json) matching this exact schema, AND ALL FEEDBACK TEXT MUST BE IN VIETNAMESE (TẤT CẢ PHẢN HỒI BẰNG TIẾNG VIỆT):
{
  "fluencyCoherence": number,
  "lexicalResource": number,
  "grammarAccuracy": number,
  "pronunciation": number,
  "bandScore": number,
  "aiFeedback": {
    "fluencyCoherence": "feedback string",
    "lexicalResource": "feedback string",
    "grammarAccuracy": "feedback string",
    "pronunciation": "feedback string",
    "general": "overall summary feedback"
  }
}
Note: bandScore should be the average of the 4 criteria rounded to the nearest 0.5.
`;

    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Student Transcript:\n${transcript}` }
      ]);

      const response = await result.response;
      let text = response.text();

      // Clean up potential markdown formatting from Gemini
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(text);
      return parsedData;
    } catch (error) {
      console.error("[Gemini API] Error scoring speaking response:", error);
      throw new Error("Failed to score speaking response");
    }
  }

  /**
   * Scores a student's writing essay against IELTS criteria using Gemini API.
   * 
   * @param essayText The student's essay text
   * @param prompt The original writing prompt
   * @returns Structured JSON containing band scores and feedback
   */
  static async scoreWriting(essayText: string, prompt: string) {
    if (!essayText || essayText.trim().length === 0) {
      throw new Error("Essay text is empty");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert IELTS Writing examiner. You are evaluating a student's essay response based on the prompt.
The writing prompt/task was: "${prompt}"

Please evaluate the student's response strictly on the following 4 IELTS writing criteria:
1. Task Achievement / Task Response (0.0 - 9.0)
2. Coherence and Cohesion (0.0 - 9.0)
3. Lexical Resource (0.0 - 9.0)
4. Grammatical Range and Accuracy (0.0 - 9.0)

You must return the result STRICTLY as a valid JSON object without any markdown wrapping (no \`\`\`json) matching this exact schema, AND ALL FEEDBACK TEXT MUST BE IN VIETNAMESE (TẤT CẢ PHẢN HỒI BẰNG TIẾNG VIỆT):
{
  "taskAchievement": number,
  "coherenceCohesion": number,
  "lexicalResource": number,
  "grammarAccuracy": number,
  "bandScore": number,
  "aiFeedback": {
    "taskAchievement": "detailed feedback string",
    "coherenceCohesion": "detailed feedback string",
    "lexicalResource": "detailed feedback string",
    "grammarAccuracy": "detailed feedback string",
    "general": "overall summary and suggestions for improvement"
  }
}
Note: bandScore should be the average of the 4 criteria rounded to the nearest 0.5 (e.g. 6.0, 6.5, 7.0, etc.).
`;

    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Student Essay:\n${essayText}` }
      ]);

      const response = await result.response;
      let text = response.text();

      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(text);
      return parsedData;
    } catch (error) {
      console.error("[Gemini API] Error scoring writing response:", error);
      throw new Error("Failed to score writing response");
    }
  }
}
