import { GoogleGenAI, Type } from "@google/genai";
import { Article, SearchResult } from "../types";

// Initialize the API client
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Calculate Cosine Similarity
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
};

export const semanticSearch = async (
  query: string,
  articles: Article[]
): Promise<SearchResult[]> => {
  const ai = getAIClient();
  if (!ai) {
    console.warn("Gemini API Key missing. Falling back to keyword search.");
    return articles
      .filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.contentSnippet.toLowerCase().includes(query.toLowerCase()))
      .map(a => ({ ...a, similarity: 1 }));
  }

  try {
    const queryEmbeddingResponse = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: { parts: [{ text: query }] },
    });
    
    const queryVector = queryEmbeddingResponse.embeddings?.[0]?.values;

    if (!queryVector) throw new Error("Failed to generate query embedding");

    // Limit to top 30 recent for demo performance
    const candidates = articles.slice(0, 30);
    const results: SearchResult[] = [];

    for (const article of candidates) {
        const textToEmbed = `${article.title}: ${article.contentSnippet}`;
        try {
            const articleResponse = await ai.models.embedContent({
                model: "text-embedding-004",
                contents: { parts: [{ text: textToEmbed }] }
            });
            const articleVector = articleResponse.embeddings?.[0]?.values;
            
            if (articleVector) {
                const similarity = cosineSimilarity(queryVector, articleVector);
                results.push({ ...article, similarity });
            }
        } catch (e) {
            console.warn("Skipping article due to embedding error", e);
        }
    }

    return results.sort((a, b) => b.similarity - a.similarity);

  } catch (error) {
    console.error("Semantic search failed:", error);
    return [];
  }
};

export const translateBatch = async (articles: Article[]): Promise<Article[]> => {
  const ai = getAIClient();
  if (!ai || articles.length === 0) return articles;

  // Prepare minimal payload
  const inputs = articles.map(a => ({
    id: a.id,
    title: a.title,
    snippet: a.contentSnippet,
    feedName: a.feedName
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the 'title', 'snippet', and 'feedName' fields in the following JSON array to Simplified Chinese (zh-CN). 
                 Do NOT translate 'id'. Return the result as a valid JSON array.
                 
                 Input JSON:
                 ${JSON.stringify(inputs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              snippet: { type: Type.STRING },
              feedName: { type: Type.STRING },
            }
          }
        }
      }
    });

    const translatedItems = JSON.parse(response.text || '[]');
    
    // Merge translations back into original articles
    return articles.map(original => {
      const translated = translatedItems.find((t: any) => t.id === original.id);
      if (translated) {
        return {
          ...original,
          title: translated.title,
          contentSnippet: translated.snippet,
          feedName: translated.feedName
        };
      }
      return original;
    });

  } catch (error) {
    console.error("Translation failed:", error);
    return articles;
  }
};