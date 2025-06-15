// Recipe Assistant specific AI prompts and logic

import { aiService } from "~/lib/ai";

const fallbackRecipes = [
  {
    response: `I'd love to help you create a delicious meal! Based on common pantry ingredients, here's a simple recipe:

**Classic Pasta Aglio e Olio**

A timeless Italian dish that's quick, flavorful, and uses minimal ingredients.

\`\`\`json
{
  "title": "Classic Pasta Aglio e Olio",
  "servings": 4,
  "prepTime": "5 minutes",
  "cookTime": "15 minutes",
  "ingredients": [
    "400g spaghetti or linguine",
    "6 cloves garlic, thinly sliced",
    "1/2 cup extra virgin olive oil",
    "1/4 teaspoon red pepper flakes",
    "1/4 cup fresh parsley, chopped",
    "Salt to taste",
    "Freshly ground black pepper",
    "Grated Parmesan cheese (optional)"
  ],
  "instructions": [
    "Bring a large pot of salted water to boil and cook pasta according to package directions",
    "While pasta cooks, heat olive oil in a large skillet over medium heat",
    "Add sliced garlic and cook until golden and fragrant, about 2-3 minutes",
    "Add red pepper flakes and cook for 30 seconds",
    "Reserve 1 cup pasta water before draining",
    "Add drained pasta to the skillet with garlic oil",
    "Toss vigorously, adding pasta water gradually to create a silky sauce",
    "Remove from heat, add parsley, and season with salt and pepper",
    "Serve immediately with grated Parmesan if desired"
  ],
  "tips": "The key is to not burn the garlic - it should be golden, not brown. The pasta water helps create a creamy sauce that coats the noodles perfectly."
}
\`\`\`

This recipe is perfect for when you want something quick but satisfying. The combination of garlic, olive oil, and a hint of heat creates a wonderfully aromatic dish. Enjoy your cooking!`
  },
  {
    response: `Based on typical refrigerator staples, here's a comforting recipe for you:

**Vegetable Fried Rice**

Transform leftover rice into a delicious meal packed with flavor and nutrition.

\`\`\`json
{
  "title": "Vegetable Fried Rice",
  "servings": 4,
  "prepTime": "10 minutes",
  "cookTime": "15 minutes",
  "ingredients": [
    "3 cups cooked rice (preferably day-old)",
    "3 eggs, beaten",
    "2 tablespoons vegetable oil",
    "1 cup mixed frozen vegetables",
    "3 green onions, sliced",
    "3 cloves garlic, minced",
    "2 tablespoons soy sauce",
    "1 tablespoon sesame oil",
    "Salt and pepper to taste"
  ],
  "instructions": [
    "Heat 1 tablespoon oil in a large wok or skillet over high heat",
    "Pour in beaten eggs and scramble until just set, then remove and set aside",
    "Add remaining oil to the pan and heat until shimmering",
    "Add frozen vegetables and stir-fry for 2-3 minutes",
    "Add garlic and cook for 30 seconds until fragrant",
    "Add rice, breaking up any clumps with your spatula",
    "Stir-fry for 3-4 minutes until rice is heated through",
    "Return eggs to the pan along with soy sauce and sesame oil",
    "Toss everything together and cook for another minute",
    "Garnish with green onions and serve hot"
  ],
  "tips": "Day-old rice works best as it's drier and won't get mushy. If using fresh rice, spread it out to cool first."
}
\`\`\`

This versatile dish is perfect for using up leftover rice and any vegetables you have on hand. Feel free to add protein like tofu or shrimp!`
  }
];

export async function generateRecipeResponse(
  userMessage: string,
  hasImage: boolean = false
): Promise<string> {
  try {
    const imageContext = hasImage 
      ? "The user has shared a photo of ingredients. Based on what you can see in the image and their message, suggest recipes that use those ingredients."
      : "The user is describing ingredients they have or asking for recipe suggestions. Provide helpful recipe recommendations based on their input.";

    const prompt = `You are a friendly, warm, and knowledgeable AI chef assistant. Your personality is encouraging, helpful, and passionate about cooking. You love sharing recipes and cooking tips in a conversational, approachable way.

${imageContext}

User's message: "${userMessage}"

Please provide a recipe suggestion that:
1. Is practical and uses common cooking techniques
2. Includes clear measurements and timing
3. Has COMPLETE step-by-step instructions - include ALL steps from start to finish, typically 5-10 steps
4. Offers helpful tips or variations when relevant

IMPORTANT: Make sure to include ALL cooking steps in the instructions array. Do not abbreviate or stop early.

Format your response as follows:
1. Start with a warm, encouraging greeting and acknowledge their request
2. Briefly describe the recipe you're suggesting and why it's a good choice
3. Include the recipe details in a JSON code block with this exact structure:

\`\`\`json
{
  "title": "Recipe Name",
  "servings": 4,
  "prepTime": "X minutes",
  "cookTime": "Y minutes",
  "ingredients": [
    "ingredient 1 with amount",
    "ingredient 2 with amount"
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tips": "Any helpful tips or variations"
}
\`\`\`

4. End with an encouraging message about the recipe

Keep your tone warm, friendly, and enthusiastic about cooking. Make the user feel confident they can create something delicious!`;

    const response = await aiService.generate(prompt, {
      temperature: 0.8,
      maxTokens: 4096,
      topP: 0.95,
      topK: 50
    });

    return response;
  } catch (error) {
    console.error('Failed to generate recipe:', error);
    // Return a random fallback recipe
    const fallback = fallbackRecipes[Math.floor(Math.random() * fallbackRecipes.length)];
    return fallback.response;
  }
}