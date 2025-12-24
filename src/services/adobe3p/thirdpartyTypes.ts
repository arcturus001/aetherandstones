export interface Size {
  width: number
  height: number
}

export interface Output {
  storeInputs?: boolean
}

export interface GenerationMetadata {
  module?: string
  sourceDocumentId?: string
  filterString?: string
  originalPrompt?: string
  subPrompts?: Array<Record<string, unknown>>
  canvasImageReference?: {
    creativeCloudFileId: string
    creativeCloudComponentId: string
    semanticUsage: string // 'imageReference'
  }
}

export interface ReferenceBlob {
  id: string
  usage: 'subject' | 'general' | 'nonGenRef' | 'unknown'
  promptReference?: number
}

export interface ThirdPartyGenerateRequest {
  modelId: string
  modelVersion?: string
  n?: number
  seeds?: number[]
  prompt: string
  size?: Size
  generateAudio?: boolean // video only
  output?: Output
  generationMetadata?: GenerationMetadata
  referenceBlobs?: ReferenceBlob[]
  modelSpecificPayload?: Record<string, unknown>
}

export interface ThirdPartyImageGenerateRequest extends ThirdPartyGenerateRequest {
  modelId: 'flux' | 'fluxPro' | 'fluxUltra' | 'imagen' | 'gpt-4o-image' | 'gemini-flash'
}

export interface ThirdPartyVideoGenerateRequest extends ThirdPartyGenerateRequest {
  modelId: 'veo' | 'pika' | 'luma'
  generateAudio?: boolean
}

export interface ThirdPartyGenerateResponse {
  links: {
    result: {
      href: string
    }
  }
}

export interface JobProgressResponse {
  links: {
    result: {
      href: string
    }
  }
  progress: number
}

export interface ImageOutput {
  seed: number
  image: {
    id: string
    presignedUrl: string
  }
}

export interface VideoOutput {
  seed: number
  video: {
    id: string
    presignedUrl: string
  }
}

export interface ImageJobResult {
  outputs: ImageOutput[]
  modelId: string
  modelVersion?: string
  size: Size
  contentType: 'image/png' | 'image/jpeg'
}

export interface VideoJobResult {
  outputs: VideoOutput[]
  modelId: string
  modelVersion?: string
  size: Size
  contentType: 'video/mp4' | 'video/webm' | 'video/quicktime'
}

export type JobResult = ImageJobResult | VideoJobResult | JobProgressResponse

export interface ThirdPartyImageGenerateOptions {
  modelId: 'flux' | 'fluxPro' | 'fluxUltra' | 'imagen' | 'gpt-4o-image' | 'gemini-flash'
  modelVersion?: string
  n?: number
  seeds?: number[]
  size?: Size
  output?: Output
  generationMetadata?: GenerationMetadata
  referenceBlobs?: ReferenceBlob[]
  modelSpecificPayload?: Record<string, unknown>
}

export interface ThirdPartyVideoGenerateOptions {
  modelId: 'veo' | 'pika' | 'luma'
  modelVersion?: string
  n?: number
  seeds?: number[]
  size?: Size
  generateAudio?: boolean
  output?: Output
  generationMetadata?: GenerationMetadata
  referenceBlobs?: ReferenceBlob[]
  modelSpecificPayload?: Record<string, unknown>
}

// Helper types for model-specific payloads
export interface ImagenModelSpecificPayload {
  prompt?: string
  seed?: number
  sample_count?: number
  reference_images?: unknown[]
  aspect_ratio?: string
}

export interface VeoModelSpecificPayload {
  prompt?: string
  image?: unknown
  aspect_ratio?: string
  seed?: number
  sample_count?: number
  duration_seconds?: number
}

export interface FluxModelSpecificPayload {
  prompt?: string
  aspect_ratio?: string
  prompt_upsampling?: boolean
  seed?: number
  safety_tolerance?: number
  output_format?: string
  image_prompt?: string
  raw?: boolean
}

export interface GeminiFlashModelSpecificPayload {
  prompt?: string
  n?: number
  seeds?: number[]
  output?: {
    storeInputs?: boolean
  }
  referenceBlobs?: Array<{
    id: string
    usage: 'general' | 'subject' | 'nonGenRef' | 'unknown'
  }>
  generationMetadata?: {
    module?: string
    [key: string]: unknown
  }
} 