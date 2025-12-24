/**
 * OPENAI RESPONSES SERVICE
 * Implementation for Azure OpenAI Responses API
 * Based on the deployed service at: https://gammon-llm-api-service-deploy-ethos505-stage-va6-1688e7.stage.cloud.adobe.io
 * 
 * Usage Examples:
 * 
 * // Simple text completion
 * const response = await createResponsesCompletion({
 *   input: "Hello, how are you?",
 *   max_tokens: 100
 * });
 * 
 * // Structured messages
 * const messages = [
 *   createSystemMessage("You are a helpful assistant."),
 *   createUserTextMessage("What is the capital of France?")
 * ];
 * const response = await createResponsesCompletion({ input: messages });
 * 
 * // Multi-modal with image
 * const imageMessage = createUserMessageWithImage(
 *   "What's in this image?",
 *   "https://example.com/image.jpg"
 * );
 * const response = await sendResponsesMultiModalMessage([imageMessage]);
 * 
 * // Simple text helper
 * const text = await sendResponsesTextMessage("Explain quantum computing");
 * 
 * Note: The Responses API uses specific content types with 'text' field:
 * - 'input_text' for user text input: { type: 'input_text', text: string }
 * - 'output_text' for assistant text output: { type: 'output_text', text: string }
 * - 'input_image' for image inputs: { type: 'input_image', image_url: string }
 * - 'input_file' for file inputs: { type: 'input_file', filename: string, file_id: string }
 */

import { createApiClient } from '../apiClient';
import { OPENAI_RESPONSES_API } from './openaiConstants';

// OpenAI Responses API Types
export interface OpenAIResponsesInputTextContent {
  type: 'input_text';
  text: string;
}

export interface OpenAIResponsesOutputTextContent {
  type: 'output_text';
  text: string;
}

export interface OpenAIResponsesImageContent {
  type: 'input_image';
  image_url: string;
}

export interface OpenAIResponsesFileContent {
  type: 'input_file';
  filename: string;
  file_id: string;
}

export type OpenAIResponsesContent = OpenAIResponsesInputTextContent | OpenAIResponsesOutputTextContent | OpenAIResponsesImageContent | OpenAIResponsesFileContent;

export interface OpenAIResponsesMessage {
  role: 'user' | 'assistant' | 'system';
  content: OpenAIResponsesContent[];
}

export interface OpenAIResponsesRequest {
  model?: string;
  input: string | OpenAIResponsesMessage[];
  // Note: temperature, top_p, frequency_penalty, presence_penalty are not supported by this model
  // Only include parameters that are actually supported by the Responses API
  [key: string]: unknown; // Allow additional parameters supported by the Responses API
}

export interface OpenAIResponsesOutputItem {
  id: string;
  type: 'reasoning' | 'message';
  status?: 'completed';
  content?: Array<{
    type: 'output_text';
    annotations: unknown[];
    text: string;
  }>;
  role?: 'assistant';
  summary?: unknown[];
}

export interface OpenAIResponsesUsage {
  input_tokens: number;
  input_tokens_details: {
    cached_tokens: number;
  };
  output_tokens: number;
  output_tokens_details: {
    reasoning_tokens: number;
  };
  total_tokens: number;
}

export interface OpenAIResponsesResponse {
  id: string;
  object: 'response';
  created_at: number;
  status: 'completed';
  model: string;
  output: OpenAIResponsesOutputItem[];
  output_text: string; // Convenient field with the final text response
  usage: OpenAIResponsesUsage;
  background: boolean;
  content_filters: unknown;
  error: unknown;
  incomplete_details: unknown;
  instructions: unknown;
  max_output_tokens: unknown;
  max_tool_calls: unknown;
  parallel_tool_calls: boolean;
  previous_response_id: unknown;
  prompt_cache_key: unknown;
  reasoning: {
    effort: string;
    summary: unknown;
  };
  safety_identifier: unknown;
  service_tier: string;
  store: boolean;
  temperature: number;
  text: {
    format: {
      type: string;
    };
  };
  tool_choice: string;
  tools: unknown[];
  top_p: number;
  truncation: string;
  user: unknown;
  metadata: unknown;
}

// Create the OpenAI Responses API client
export const openaiResponsesClient = createApiClient({
  baseUrl: OPENAI_RESPONSES_API.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: OPENAI_RESPONSES_API.DEFAULT_TIMEOUT,
  retries: OPENAI_RESPONSES_API.DEFAULT_RETRIES
});

/**
 * Create an input text content object for OpenAI Responses API
 */
export function createResponsesInputTextContent(text: string): OpenAIResponsesInputTextContent {
  return {
    type: 'input_text',
    text: text
  };
}

/**
 * Create an output text content object for OpenAI Responses API
 */
export function createResponsesOutputTextContent(text: string): OpenAIResponsesOutputTextContent {
  return {
    type: 'output_text',
    text: text
  };
}

/**
 * Create an image content object for OpenAI Responses API
 */
export function createResponsesImageContent(imageUrl: string): OpenAIResponsesImageContent {
  return {
    type: 'input_image',
    image_url: imageUrl
  };
}

/**
 * Create a file content object for OpenAI Responses API
 */
export function createResponsesFileContent(filename: string, fileId: string): OpenAIResponsesFileContent {
  return {
    type: 'input_file',
    filename,
    file_id: fileId
  };
}

/**
 * Create a message object for OpenAI Responses API
 */
export function createResponsesMessage(
  role: 'user' | 'assistant' | 'system',
  content: OpenAIResponsesContent[]
): OpenAIResponsesMessage {
  return {
    role,
    content
  };
}

/**
 * Send a request to the OpenAI Responses API
 */
export async function createResponsesCompletion(
  request: OpenAIResponsesRequest
): Promise<OpenAIResponsesResponse> {
  // Set default model if not provided
  const requestWithDefaults = {
    model: OPENAI_RESPONSES_API.DEFAULT_MODEL,
    ...request
  };

  return openaiResponsesClient.post<OpenAIResponsesResponse>(
    OPENAI_RESPONSES_API.OPENAI_ENDPOINT,
    requestWithDefaults
  );
}

/**
 * Send a simple text message to the OpenAI Responses API
 */
export async function sendResponsesMessage(
  input: string | OpenAIResponsesMessage[],
  options: Partial<Omit<OpenAIResponsesRequest, 'input'>> = {}
): Promise<string> {
  const response = await createResponsesCompletion({
    input,
    ...options
  });

  console.log('OpenAI Responses API response:', JSON.stringify(response, null, 2));

  // Use the convenient output_text field, or extract from output array
  if (response.output_text) {
    console.log('Using output_text field:', response.output_text);
    return response.output_text;
  }

  // Fallback: extract text from output array
  const messageOutput = response.output?.find(item => item.type === 'message' && item.content);
  if (messageOutput?.content?.[0]?.text) {
    console.log('Using output array text:', messageOutput.content[0].text);
    return messageOutput.content[0].text;
  }

  console.warn('No text found in response, returning empty string');
  return '';
}

/**
 * Send a text message with additional options to the OpenAI Responses API
 */
export async function sendResponsesTextMessage(
  text: string,
  options: Partial<Omit<OpenAIResponsesRequest, 'input'>> = {}
): Promise<string> {
  return sendResponsesMessage(text, options);
}

/**
 * Send a multi-modal message (text + images/files) to the OpenAI Responses API
 */
export async function sendResponsesMultiModalMessage(
  messages: OpenAIResponsesMessage[],
  options: Partial<Omit<OpenAIResponsesRequest, 'input'>> = {}
): Promise<string> {
  return sendResponsesMessage(messages, options);
}

/**
 * Helper function to create a user message with text and image
 */
export function createUserMessageWithImage(
  text: string,
  imageUrl: string
): OpenAIResponsesMessage {
  return createResponsesMessage('user', [
    createResponsesInputTextContent(text),
    createResponsesImageContent(imageUrl)
  ]);
}

/**
 * Helper function to create a user message with text and file
 */
export function createUserMessageWithFile(
  text: string,
  filename: string,
  fileId: string
): OpenAIResponsesMessage {
  return createResponsesMessage('user', [
    createResponsesInputTextContent(text),
    createResponsesFileContent(filename, fileId)
  ]);
}

/**
 * Helper function to create a simple user text message
 */
export function createUserTextMessage(text: string): OpenAIResponsesMessage {
  return createResponsesMessage('user', [
    createResponsesInputTextContent(text)
  ]);
}

/**
 * Helper function to create a system message
 */
export function createSystemMessage(text: string): OpenAIResponsesMessage {
  return createResponsesMessage('system', [
    createResponsesInputTextContent(text)
  ]);
}
