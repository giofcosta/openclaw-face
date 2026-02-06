/**
 * Avatar Generation API
 * Uses Pollinations.ai (free, no API key required)
 * With fallback models for reliability
 */

const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/';

// Models to try in order of preference
const FALLBACK_MODELS = ['flux', 'turbo'];

/**
 * Check if an image URL is valid by making a HEAD request
 */
async function validateImageUrl(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is an image
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/');
  } catch (error) {
    console.warn('Image validation failed:', error.message);
    return false;
  }
}

/**
 * Build Pollinations URL with parameters
 */
function buildImageUrl(prompt, options, model = null) {
  const {
    width = 512,
    height = 512,
    seed = Math.floor(Math.random() * 1000000),
    nologo = true,
    enhance = true,
  } = options;

  const encodedPrompt = encodeURIComponent(prompt);
  
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: seed.toString(),
    nologo: nologo.toString(),
    enhance: enhance.toString(),
  });
  
  if (model) {
    params.set('model', model);
  }

  return `${POLLINATIONS_URL}${encodedPrompt}?${params}`;
}

export async function generateAvatar(prompt, options = {}) {
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const optionsWithSeed = { ...options, seed };
  
  // Try each model in sequence until one works
  for (const model of FALLBACK_MODELS) {
    const imageUrl = buildImageUrl(prompt, optionsWithSeed, model);
    
    console.log(`Trying model: ${model}`);
    
    const isValid = await validateImageUrl(imageUrl);
    
    if (isValid) {
      console.log(`Success with model: ${model}`);
      return {
        success: true,
        url: imageUrl,
        seed,
        prompt,
        model,
      };
    }
    
    console.warn(`Model ${model} failed, trying next...`);
  }
  
  // All models failed
  console.error('All Pollinations models failed');
  return {
    success: false,
    error: 'All image generation models are currently unavailable. Please try again later.',
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
