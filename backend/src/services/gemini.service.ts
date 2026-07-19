import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SpeakingEvaluation {
  fluencyCoherence: number;
  lexicalResource: number;
  grammarAccuracy: number;
  pronunciation: number;
  bandScore: number;
  aiFeedback: {
    fluencyCoherence: string;
    lexicalResource: string;
    grammarAccuracy: string;
    pronunciation: string;
    general: string;
  };
}

export interface WritingEvaluation {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammarAccuracy: number;
  bandScore: number;
  aiFeedback: {
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammarAccuracy: string;
    general: string;
  };
}

export class GeminiService {
  private static getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  static async scoreSpeaking(transcript: string, prompt?: string): Promise<SpeakingEvaluation> {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("Transcript is empty");
    }

    const systemPrompt = `Bạn là một giám khảo IELTS Speaking vô cùng khắt khe và giàu kinh nghiệm. Nhiệm vụ của bạn là đánh giá và chấm điểm phần nói của thí sinh dựa trên văn bản đã được ghi âm và chuyển đổi thành văn bản (transcript).
${prompt ? `Câu hỏi/Chủ đề của giám khảo dành cho thí sinh: "${prompt}"` : ''}

QUY TẮC CHẤM ĐIỂM QUAN TRỌNG VÀ NGHIÊM NGẶT (IELTS STANDARDS):
1. YÊU CẦU VỀ ĐỘ DÀI VÀ CHI TIẾT (ELABORATION PENALTY): Thí sinh phải mở rộng câu trả lời. Nếu thí sinh chỉ trả lời một câu cụt lủn (ví dụ chỉ nói đúng 1 ý cơ bản như "The most popular TV program is Tom and Jerry"), hoặc dưới 20 từ cho các câu hỏi cần giải thích, BẮT BUỘC phạt nặng điểm Fluency & Coherence và Lexical Resource (không vượt quá 2.5 hoặc 3.0). Trả lời quá ngắn đồng nghĩa với việc không đủ ngôn ngữ để đánh giá.
2. ĐÁNH GIÁ ĐÚNG CHỦ ĐỀ (STRICT PROMPT ALIGNMENT): Câu trả lời có giải quyết đầy đủ tất cả các khía cạnh của câu hỏi không? Nếu đề có nhiều ý (ví dụ: "What are they? Why is this?") mà thí sinh chỉ trả lời một vế, điểm Task/Fluency tối đa là 3.0.
3. PHẠT ĐỐI VỚI VĂN BẢN RỖNG / VÔ NGHĨA (NOISE PENALTY): Nếu transcript chỉ chứa các từ đệm ("um", "uh"), dưới 5 từ vô nghĩa, BẮT BUỘC chấm 0.0 hoặc 1.0 cho tất cả 4 tiêu chí.
4. TỪ VỰNG VÀ NGỮ PHÁP (LEXICAL & GRAMMAR): Trả lời bằng các câu đơn giản nhất (Subject + Verb + Object) mà không có mệnh đề phụ, không có từ nối, không có thành ngữ/từ vựng theo chủ đề thì Grammar và Vocabulary KHÔNG ĐƯỢC vượt quá 3.5. 
5. KHÔNG TỰ SUY DIỄN (NO HALLUCINATION): Chỉ đánh giá chính xác dựa trên transcript được cung cấp.
6. SỰ CHẤP NHẬN SAI SỐ CỦA STT (STT TOLERANCE): Bỏ qua các lỗi chính tả hiển nhiên do nhận diện giọng nói (STT).

Bạn phải đánh giá theo 4 tiêu chí chấm điểm IELTS Speaking:
1. Fluency and Coherence (0.0 - 9.0)
2. Lexical Resource (0.0 - 9.0)
3. Grammatical Range and Accuracy (0.0 - 9.0)
4. Pronunciation (0.0 - 9.0)

Yêu cầu trả về kết quả định dạng JSON thuần túy theo đúng cấu trúc sau đây. Toàn bộ phần nhận xét trong object "aiFeedback" bắt buộc phải viết bằng TIẾNG VIỆT, giải thích chi tiết, khắt khe đúng chuẩn giám khảo thật:
{
  "fluencyCoherence": number,
  "lexicalResource": number,
  "grammarAccuracy": number,
  "pronunciation": number,
  "bandScore": number,
  "aiFeedback": {
    "fluencyCoherence": "Nhận xét khắt khe về độ dài, sự mở rộng ý, và độ trôi chảy.",
    "lexicalResource": "Nhận xét về sự nghèo nàn/phong phú của từ vựng.",
    "grammarAccuracy": "Nhận xét về sự đa dạng và độ phức tạp của cấu trúc ngữ pháp.",
    "pronunciation": "Nhận xét dự đoán lỗi phát âm.",
    "general": "Đánh giá tổng quát toàn bộ bài nói, phê bình mức độ đạt chuẩn IELTS và lời khuyên để tăng band score."
  }
}

*Lưu ý quan trọng: Điểm bandScore tổng là trung bình cộng của 4 điểm tiêu chí, làm tròn đến 0.5 gần nhất. Hãy chấm thật gắt gao với các bài nói hời hợt, quá ngắn, hoặc lặp từ!`;

    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt
      });

      console.log(`[Gemini Service] Sending Speaking scoring request for transcript length: ${transcript.length}`);
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `Student Transcript:\n${transcript}` }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = result.response.text();
      let parsedData: SpeakingEvaluation;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[Gemini API] Failed to parse JSON. Raw text was:", responseText);
        throw parseError;
      }
      return parsedData;
    } catch (error: any) {
      console.error("[Gemini API] Error scoring speaking response:", error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error('Hệ thống AI đang quá tải hoặc hết lượt đánh giá miễn phí. Vui lòng đợi khoảng 1 phút rồi thử lại nhé!');
      }
      throw new Error(`Lỗi đánh giá AI: ${errorMessage}`);
    }
  }

  static async scoreWriting(essayText: string, prompt: string): Promise<WritingEvaluation> {
    if (!essayText || essayText.trim().length === 0) {
      throw new Error("Essay text is empty");
    }

    const systemPrompt = `Bạn là một giám khảo IELTS Writing vô cùng khắt khe và giàu kinh nghiệm. Nhiệm vụ của bạn là đánh giá và chấm điểm bài viết essay của thí sinh dựa trên đề bài được cung cấp.
Đề bài viết (Prompt/Task): "${prompt}"

QUY TẮC CHẤM ĐIỂM QUAN TRỌNG:
1. ĐÁNH GIÁ ĐÚNG ĐỀ BÀI (STRICT PROMPT ALIGNMENT): Bạn PHẢI kiểm tra kỹ xem bài viết có trả lời trực tiếp và đầy đủ cho đề bài hay không. Nếu bài viết hoàn toàn lạc đề hoặc sử dụng các bài mẫu học thuộc lòng mà không ăn khớp với đề bài, hãy chấm Task Achievement / Task Response tối đa là 1.0 hoặc thậm chí là 0.0.
2. PHẠT ĐỐI VỚI BÀI QUÁ NGẮN HOẶC VÔ NGHĨA (EMPTY/GARBAGE PENALTY): Nếu bài viết chứa dưới 15 từ hoặc chỉ toàn các ký tự lộn xộn vô nghĩa, bạn BẮT BUỘC phải chấm điểm 0.0 cho tất cả 4 tiêu chí.
3. PHẠT BÀI VIẾT QUÁ NGẮN DƯỚI HẠN (BAND 1.0 PENALTY): Nếu bài viết có từ 15 đến 30 từ nhưng không truyền đạt được ý nghĩa mạch lạc, hãy chấm ĐÚNG 1.0 cho tất cả tiêu chí.
4. KHÔNG TỰ SUY DIỄN (NO HALLUCINATION): Chỉ đánh giá dựa trên văn bản thực tế thí sinh viết. Không tự ý suy đoán ý đồ nếu diễn đạt không rõ ràng.

Bạn phải đánh giá bài viết theo 4 tiêu chí chấm điểm IELTS Writing chính thống:
1. Task Achievement / Task Response (Khả năng hoàn thành nhiệm vụ) (0.0 - 9.0)
2. Coherence and Cohesion (Sự mạch lạc và Liên kết) (0.0 - 9.0)
3. Lexical Resource (Vốn từ vựng) (0.0 - 9.0)
4. Grammatical Range and Accuracy (Sự đa dạng và Chính xác của Ngữ pháp) (0.0 - 9.0)

Yêu cầu trả về kết quả định dạng JSON thuần túy theo đúng cấu trúc sau đây. Toàn bộ phần nhận xét trong object "aiFeedback" bắt buộc phải viết bằng TIẾNG VIỆT, giải thích chi tiết, khắt khe nhưng mang tính xây dựng cao:
{
  "taskAchievement": number,
  "coherenceCohesion": number,
  "lexicalResource": number,
  "grammarAccuracy": number,
  "bandScore": number,
  "aiFeedback": {
    "taskAchievement": "Nhận xét chi tiết bằng tiếng Việt về mức độ đáp ứng yêu cầu đề bài, cách thí sinh phát triển các lập luận",
    "coherenceCohesion": "Nhận xét chi tiết bằng tiếng Việt về liên kết đoạn, từ nối và tính mạch lạc của bài viết",
    "lexicalResource": "Nhận xét chi tiết bằng tiếng Việt về vốn từ, các từ dùng sai ngữ cảnh hoặc lỗi chính tả và các collocations tốt cần bổ sung",
    "grammarAccuracy": "Nhận xét chi tiết bằng tiếng Việt chỉ ra các cấu trúc ngữ pháp bị sai lệch và đề xuất cấu trúc câu phức/câu ghép nâng cao",
    "general": "Đánh giá tổng quát toàn bộ bài viết essay và chiến lược giúp thí sinh nâng cao band score viết"
  }
}

*Lưu ý quan trọng: Điểm bandScore tổng là trung bình cộng của 4 điểm tiêu chí thành phần, làm tròn đến 0.5 gần nhất theo chuẩn IELTS (ví dụ: trung bình là 6.125 thì làm tròn thành 6.0; trung bình là 6.25 thì làm tròn thành 6.5; trung bình là 6.75 thì làm tròn thành 7.0).`;

    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt
      });

      console.log(`[Gemini Service] Sending Writing scoring request for essay length: ${essayText.length}`);
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `Student Essay:\n${essayText}` }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = result.response.text();
      let parsedData: WritingEvaluation;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[Gemini API] Failed to parse JSON. Raw text was:", responseText);
        throw parseError;
      }
      return parsedData;
    } catch (error: any) {
      console.error("[Gemini API] Error scoring writing response:", error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error('Hệ thống AI đang quá tải hoặc hết lượt đánh giá miễn phí. Vui lòng đợi khoảng 1 phút rồi thử lại nhé!');
      }
      throw new Error(`Lỗi đánh giá AI: ${errorMessage}`);
    }
  }
}
