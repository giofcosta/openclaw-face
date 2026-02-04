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

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(imageUrl, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
    }

    // Verify we got an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid response type: ${contentType}. Expected image.`);
    }

    // Return as blob or convert to base64
    const blob = await response.blob();
    
    // Verify blob is not empty
    if (blob.size === 0) {
      throw new Error('Generated image is empty');
    }
    
    return {
      success: true,
      url: imageUrl,
      blob,
      seed,
      prompt,
    };
  } catch (error) {
    console.error('Avatar generation error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. The image generation is taking too long. Please try again.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    return {
      success: false,
      error: errorMessage,
      prompt,
    };
  }
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
