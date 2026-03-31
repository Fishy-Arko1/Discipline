import { FoodEntry } from '../types';
import { randomId } from '../lib/utils';

const keywordFoods = [
  { keywords: ['pizza', 'margherita', 'pepperoni'], name: 'Pizza', calories: 285 },
  { keywords: ['burger', 'cheeseburger'], name: 'Burger', calories: 520 },
  { keywords: ['sandwich', 'sub'], name: 'Sandwich', calories: 320 },
  { keywords: ['salad'], name: 'Salad Bowl', calories: 260 },
  { keywords: ['rice', 'biryani'], name: 'Rice Meal', calories: 430 },
  { keywords: ['pasta', 'spaghetti'], name: 'Pasta', calories: 390 },
];

const fallbackMocks = [
  { name: 'Detected Meal', calories: 300 },
  { name: 'Savory Meal', calories: 340 },
  { name: 'Home-Cooked Plate', calories: 380 },
];

const lowConfidenceLabels = new Set(['donut', 'doughnut', 'cookie', 'cupcake', 'muffin', 'dessert']);

export const estimateCaloriesFromName = (name: string) => {
  const normalized = name.trim().toLowerCase();
  const match = keywordFoods.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
  return match?.calories ?? 300;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

export const createFoodEntry = ({
  name,
  calories,
  imageName,
  source,
}: {
  name: string;
  calories: number;
  imageName?: string;
  source: FoodEntry['source'];
}): FoodEntry => ({
  id: randomId(),
  name,
  calories,
  source,
  createdAt: new Date().toISOString(),
  imageName,
});

const buildMockFood = (file: File, attempt: number) => {
  const normalizedName = file.name.toLowerCase();
  const keywordMatch = keywordFoods.find((item) =>
    item.keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  if (keywordMatch) {
    return createFoodEntry({
      name: keywordMatch.name,
      calories: keywordMatch.calories,
      source: 'mock',
      imageName: file.name,
    });
  }

  const fallback = fallbackMocks[Math.min(attempt, fallbackMocks.length - 1)];

  return createFoodEntry({
    ...fallback,
    source: 'mock',
    imageName: file.name,
  });
};

export const analyzeFoodImage = async (file: File, attempt = 0): Promise<FoodEntry> => {
  try {
    const imageDataUrl = await fileToDataUrl(file);
    const response = await fetch('/api/ai/scan-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl,
        fileName: file.name,
        attempt,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        name: string;
        calories: number;
        source: FoodEntry['source'];
      };

      return createFoodEntry({
        name: data.name || 'Detected Meal',
        calories: Math.max(1, Math.round(data.calories || 250)),
        source: data.source || 'groq',
        imageName: file.name,
      });
    }

    const errorData = (await response.json()) as { message?: string; detail?: string; source?: string };
    if (errorData.source === 'groq-error') {
      throw new Error(`AI scan error: ${errorData.detail || errorData.message || 'Groq food scan failed.'}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('AI scan error:')) {
      throw error;
    }
    // Continue below for non-AI/server failures only.
  }

  const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

  if (apiKey) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://api.spoonacular.com/food/images/analyze?apiKey=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = (await response.json()) as {
          category?: { name?: string };
          nutrition?: { calories?: { value?: number } };
        };

        const guessedName = data.category?.name?.trim() || 'Detected Meal';
        const safeName = lowConfidenceLabels.has(guessedName.toLowerCase()) ? 'Detected Meal' : guessedName;

        return {
          ...createFoodEntry({
            name: safeName,
            calories: Math.round(data.nutrition?.calories?.value ?? 250),
            source: 'spoonacular',
            imageName: file.name,
          }),
          imageName: file.name,
        };
      }
    } catch {
      // Network failures fall back to deterministic mocks.
    }
  }

  return buildMockFood(file, attempt);
};
