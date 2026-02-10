/**
 * Avatar Generation API
 * Primary: DiceBear (always works, SVG)
 * Secondary: Pollinations.ai (AI-generated, may be unreliable)
 */

// Providers configuration
const PROVIDERS = {
  dicebear: {
    name: 'DiceBear',
    baseUrl: 'https://api.dicebear.com/7.x',
    styles: ['shapes', 'identicon', 'bottts', 'avataaars'],
  },
  robohash: {
    name: 'Robohash', 
    baseUrl: 'https://robohash.org',
  },
  pollinations: {
    name: 'Pollinations',
    baseUrl: 'https://image.pollinations.ai/prompt',
  },
};

/**
 * Generate DiceBear avatar URL (always works, SVG)
 */
export function generateDiceBearUrl(seed, style = 'shapes') {
  const validStyles = PROVIDERS.dicebear.styles;
  const selectedStyle = validStyles.includes(style) ? style : 'shapes';
  return `${PROVIDERS.dicebear.baseUrl}/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1e3a5f,0f172a,1e40af&size=512`;
}

/**
 * Generate Robohash avatar URL (always works, PNG)
 */
export function generateRobohashUrl(seed) {
  return `${PROVIDERS.robohash.baseUrl}/${encodeURIComponent(seed)}.png?size=512x512&set=set4`;
}

/**
 * Generate Pollinations AI avatar URL (may fail)
 */
export function generatePollinationsUrl(prompt, seed) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `${PROVIDERS.pollinations.baseUrl}/${encodedPrompt}?seed=${seed}`;
}

/**
 * Main avatar generation function
 * Returns a guaranteed-working URL using DiceBear as primary
 */
export async function generateAvatar(prompt, options = {}) {
  const {
    seed = Math.floor(Math.random() * 1000000),
    provider = 'dicebear', // Default to reliable provider
    style = 'shapes',
  } = options;

  // Generate based on provider
  let url;
  let source;

  switch (provider) {
    case 'pollinations':
      url = generatePollinationsUrl(prompt, seed);
      source = 'pollinations';
      break;
    case 'robohash':
      url = generateRobohashUrl(seed);
      source = 'robohash';
      break;
    case 'dicebear':
    default:
      url = generateDiceBearUrl(seed, style);
      source = 'dicebear';
      break;
  }

  return {
    success: true,
    url,
    seed,
    prompt,
    source,
    // Provide fallback URL in case primary fails
    fallbackUrl: generateDiceBearUrl(seed, style),
  };
}

// Style-to-seed mappings for consistent avatars
const STYLE_SEEDS = {
  kratos: 'kratos-lightning-blue-gold',
  kratosMinimal: 'kratos-minimal-clean',
  kratosCyberpunk: 'kratos-cyber-neon',
  kratosAbstract: 'kratos-abstract-geometric',
};

// DiceBear style mappings
const DICEBEAR_STYLES = {
  kratos: 'shapes',
  kratosMinimal: 'identicon',
  kratosCyberpunk: 'bottts',
  kratosAbstract: 'shapes',
};

// Default prompts for AI generation (Pollinations)
export const DEFAULT_PROMPTS = {
  kratos: 'A stylized digital avatar for an AI coding assistant named Kratos, geometric angular face with sharp diamond-shaped eyes glowing gold, blue electric blue color scheme with gold accents, lightning bolt symbol on forehead, dark navy blue background with circuit patterns, profile picture style, high quality digital art, powerful but friendly expression, tech aesthetic, clean lines',
  
  kratosMinimal: 'Minimalist geometric avatar, angular face silhouette, blue and gold colors, lightning bolt, dark background, vector art style',
  
  kratosCyberpunk: 'Cyberpunk style avatar for AI assistant Kratos, neon blue and gold, geometric angular face, glowing eyes, lightning bolt, dark futuristic background, digital art, high tech',
  
  kratosAbstract: 'Abstract geometric representation of Kratos AI, angular shapes forming a face, blue electric arcs, gold lightning, dark void background, mystical tech aesthetic',
};

/**
 * Generate Kratos-themed avatar
 * Uses DiceBear as primary (reliable) with Pollinations prompt stored for future AI use
 */
export async function generateKratosAvatar(style = 'kratos', options = {}) {
  const prompt = DEFAULT_PROMPTS[style] || DEFAULT_PROMPTS.kratos;
  const baseSeed = STYLE_SEEDS[style] || style;
  const dicebearStyle = DICEBEAR_STYLES[style] || 'shapes';
  
  // Add timestamp to seed for variation
  const seed = options.seed || `${baseSeed}-${Date.now()}`;
  
  return generateAvatar(prompt, {
    ...options,
    seed,
    provider: options.provider || 'dicebear', // Default to reliable
    style: dicebearStyle,
  });
}

/**
 * Try Pollinations with fallback to DiceBear
 * Use this when you want to attempt AI generation first
 */
export async function generateAvatarWithAIFallback(prompt, options = {}) {
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  
  // Return Pollinations URL with DiceBear fallback
  return {
    success: true,
    url: generatePollinationsUrl(prompt, seed),
    fallbackUrl: generateDiceBearUrl(seed, 'shapes'),
    seed,
    prompt,
    source: 'pollinations',
    hasFallback: true,
  };
}
