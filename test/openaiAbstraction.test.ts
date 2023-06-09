import { describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';
import { OpenaiAbstraction } from '../src/OpenaiAbstraction';
import { testPrompt } from '../src/utils/prompts';

import { openaiAbstractionMockData } from '../src/utils/mockData';

dotenv.config();

describe('OpenaiAbstraction', () => {
  describe('initializeOpenaiAbstraction', () => {
    test('should initialize OpenAI client with the provided API key', () => {
      const openaiAbstraction = new OpenaiAbstraction();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;

      openaiAbstraction.initializeOpenaiAbstraction(openaiApiKey);

      expect(openaiAbstraction.openaiApiKey).toBe(openaiApiKey);
      expect(openaiAbstraction.openaiClient).toBeDefined();
      expect(openaiAbstraction.openaiClient).toBeInstanceOf(OpenAIApi);
    });
    test('should create a valid OpenAiApi client with the provided API key', () => {
      const openaiAbstraction = new OpenaiAbstraction();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;

      openaiAbstraction.initializeOpenaiAbstraction(openaiApiKey);

      expect(openaiAbstraction.openaiClient).toBeInstanceOf(OpenAIApi);
      expect(openaiAbstraction.openaiClient.configuration).toBeInstanceOf(
        Configuration
      );
      expect(openaiAbstraction.openaiClient.configuration.apiKey).toBe(
        openaiApiKey
      );
    });
  });

  describe('basicChatgptRequest', () => {
    test('should make a basic chat GPT-3.5-turbo request and return the response', async () => {
      const openaiAbstraction = new OpenaiAbstraction();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      openaiAbstraction.initializeOpenaiAbstraction(openaiApiKey);

      const response = await openaiAbstraction.basicChatgptRequest(testPrompt);

      // i should be able to JSON.parse the response
      expect(response).toBeTruthy();
      const responseJson = JSON.parse(response as string);
      expect(responseJson.greeting).toBeTruthy();
      // expect responseJson.greeting to be a string
      expect(typeof responseJson.greeting).toBe('string');
    }, 30000);
  });

  describe('chatgptErrorResolver', () => {
    test('should make a chat GPT-3.5-turbo request to resolve an error and return the response', async () => {
      const openaiAbstraction = new OpenaiAbstraction();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      openaiAbstraction.initializeOpenaiAbstraction(openaiApiKey);

      const correctedResponse = await openaiAbstraction.chatgptErrorResolver(
        testPrompt,
        openaiAbstractionMockData.errorResolverResult,
        openaiAbstractionMockData.errorResolverError
      );
      expect(correctedResponse).toBeTruthy();
      const responseJson = JSON.parse(correctedResponse as string);
      expect(responseJson.greeting).toBeTruthy();
      // expect responseJson.greeting to be a string
      expect(typeof responseJson.greeting).toBe('string');
    }, 30000);
  });
});
