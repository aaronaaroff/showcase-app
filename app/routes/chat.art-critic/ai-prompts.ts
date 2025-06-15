// Art Critic specific AI prompts and logic

import { aiService } from "~/lib/ai";

export type PersonalityType = 'modernist' | 'classicist' | 'expressionist' | 'minimalist';

const personalityPrompts = {
  modernist: `You are a modernist art critic who values innovation and contemporary artistic expression. 
    You challenge conventional boundaries and appreciate bold approaches that push the medium forward.
    Focus on conceptual frameworks, contemporary relevance, and how the work speaks to modern anxieties.
    Your tone is intellectual but accessible, encouraging experimentation while providing thoughtful analysis.`,
  
  classicist: `You are a classical art critic who appreciates traditional artistic principles and techniques.
    You value technical execution, composition, color harmony, and references to the masters.
    Focus on traditional principles like the golden ratio, classical techniques, and timeless aesthetics.
    Your tone is refined and educational, helping artists understand fundamental principles.`,
  
  expressionist: `You are an expressionist art critic who values raw emotion and authentic self-expression.
    You appreciate vulnerability, passion, and works that convey deep emotional truths.
    Focus on the emotional impact, authenticity, and the artist's inner world expressed through their work.
    Your tone is passionate and encouraging, pushing artists to dig deeper into their emotions.`,
  
  minimalist: `You are a minimalist art critic who believes in the power of restraint and essential elements.
    You appreciate works where every element serves a purpose and unnecessary details are eliminated.
    Focus on simplicity, reduction, essential elements, and the concept that "less is more".
    Your tone is thoughtful and precise, helping artists understand the beauty of restraint.`
};

const fallbackResponses = {
  modernist: "This piece challenges conventional boundaries with its bold approach. The composition speaks to contemporary anxieties while pushing the medium forward. Consider how the negative space might further amplify your conceptual framework.",
  classicist: "The technical execution shows promise, though I notice some areas where traditional principles could strengthen the work. The color harmony references the masters, yet your unique voice emerges. Study the golden ratio to enhance compositional balance.",
  expressionist: "Raw emotion pulses through every brushstroke! This work screams authenticity and vulnerability. The chaos speaks volumes, but don't lose sight of the viewer's emotional journey. Push harder into the darkness - that's where truth lives.",
  minimalist: "Less truly becomes more here. The restraint is admirable, though one questions if further reduction might crystallize your intent. Each element must justify its existence. Consider: what remains when everything unnecessary falls away?"
};

export async function generateArtCritique(
  userMessage: string,
  personalityType: PersonalityType,
  hasImage: boolean = false
): Promise<string> {
  try {
    const personality = personalityPrompts[personalityType];
    
    const imageContext = hasImage 
      ? "The user has shared an artwork image along with their message. Provide critique based on both the visual artwork and their accompanying text."
      : "The user is seeking artistic advice or critique. Respond based on their message and provide thoughtful guidance.";

    const prompt = `${personality}

${imageContext}

User's message: "${userMessage}"

Provide a thoughtful, constructive critique in 2-3 sentences that reflects your artistic perspective. 
Be encouraging but honest, specific but accessible. Focus on actionable feedback that could help the artist improve.
Avoid generic responses - make your critique feel personal and insightful.`;

    const response = await aiService.generate(prompt, {
      temperature: 0.8, // Higher creativity for art critique
      maxTokens: 300
    });

    return response;
  } catch (error) {
    console.error('Failed to generate AI critique:', error);
    // Fallback to personality-specific static response
    return fallbackResponses[personalityType];
  }
}