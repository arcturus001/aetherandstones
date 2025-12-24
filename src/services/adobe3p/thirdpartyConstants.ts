export const THIRDPARTY_API = {
  BASE_URL: 'https://firefall-gen-3p-colligov2-dev.corp.ethos851-stage-or2.ethos.adobe.net',
  STAGE_BASE_URL: 'https://firefly-3p-stage.ff.adobe.io',
  PROD_BASE_URL: 'https://firefly-3p.ff.adobe.io',
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRIES: 3,
  COMMON_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const

export const IMAGE_MODELS = {
  FLUX: 'flux',
  FLUX_PRO: 'fluxPro',
  FLUX_ULTRA: 'fluxUltra',
  IMAGEN: 'imagen',
  GPT_4O_IMAGE: 'gpt-4o-image',
  GEMINI_FLASH: 'gemini-flash'
} as const

export const VIDEO_MODELS = {
  VEO: 'veo',
  PIKA: 'pika',
  LUMA: 'luma'
} as const

export const MODEL_VERSIONS = {
  // Imagen versions
  IMAGEN_3_CAPABILITY_001: '3.0-capability-001',
  IMAGEN_3_GENERATE_002: '3.0-generate-002',
  IMAGEN_4_GENERATE_PREVIEW: '4.0-generate-preview-05-20',
  
  // Flux versions
  FLUX_1_1: '1.1',
  
  // Gemini Flash versions
  GEMINI_FLASH_NANO_BANANA: 'nano-banana',
  GEMINI_FLASH_NANO_BANANA_PRO: 'nano-banana-2',
  
  // Veo versions
  VEO_2_GENERATE_001: '2.0-generate-001',
  VEO_3_GENERATE_PREVIEW: '3.0-generate-preview',
  
  // Pika versions
  PIKA_2_2_PIKAFRAMES: '2.2-pikaframes',
  
  // Luma versions
  LUMA_2_0_RAY: '2.0-ray'
} as const

export const REFERENCE_BLOB_USAGE = {
  SUBJECT: 'subject',
  GENERAL: 'general',
  NON_GEN_REF: 'nonGenRef',
  UNKNOWN: 'unknown' // deprecated
} as const

export const SEMANTIC_USAGE = {
  IMAGE_REFERENCE: 'imageReference'
} as const

export const DEFAULT_SIZE = {
  width: 1024,
  height: 1024
} as const

export const ENDPOINTS = {
  GENERATE_IMAGE: '/v2/3p-images/generate-async',
  GENERATE_VIDEO: '/v2/3p-videos/generate-async',
  JOB_RESULT: '/jobs/result'
} as const 