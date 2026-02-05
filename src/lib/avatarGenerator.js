/**
 * Avatar Generation API
 * Uses Pollinations.ai (free, no API key required)
 */

const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/';

export async function generateAvatar(prompt, options = {}) {
  const {
    width = 512,
    height = 512,
    seed = Math.floor(Math.random() * 1000000),
    nologo = true,
    enhance = true,
  } = options;

  // Encode prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);
  
  // Build URL with parameters
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: seed.toString(),
    nologo: nologo.toString(),
    enhance: enhance.toString(),
  });

  const imageUrl = `${POLLINATIONS_URL}${encodedPrompt}?${params}`;

  // Note: We don't fetch the image here to avoid CORS issues.
  // The image URL is returned directly and loaded via <img> tag in the component.
  // Pollinations.ai supports direct image loading without CORS restrictions.
  
  return {
    success: true,
    url: imageUrl,
    seed,
    prompt,
  };
}

// Default prompts for Kratos avatar
export const DEFAULT_PROMPTS = {
  kratos: 'A stylized digital avatar for an AI coding assistant named Kratos, geometric angular face with sharp diamond-shaped eyes glowing gold, blue electric blue color scheme with gold accents, lightning bolt symbol on forehead, dark navy blue background with circuit patterns, profile picture style, high quality digital art, powerful but friendly expression, tech aesthetic, clean lines',
  
  kratosMinimal: 'Minimalist geometric avatar, angular face silhouette, blue and gold colors, lightning bolt, dark background, vector art style',
  
  kratosCyberpunk: 'Cyberpunk style avatar for AI assistant Kratos, neon blue and gold, geometric angular face, glowing eyes, lightning bolt, dark futuristic background, digital art, high tech',
  
  kratosAbstract: 'Abstract geometric representation of Kratos AI, angular shapes forming a face, blue electric arcs, gold lightning, dark void background, mystical tech aesthetic',
};

export async function generateKratosAvatar(style = 'kratos', options = {}) {
  const prompt = DEFAULT_PROMPTS[style] || DEFAULT_PROMPTS.kratos;
  return generateAvatar(prompt, options);
}
