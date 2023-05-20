import dotenv from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';
import { ChatgptTutor } from '../src/ChatgptTutor';
import { messageTransformMockData } from '../src/utils/mockData';
import { generatedMessageTransformerParser } from '../src/utils/parsers';
import { testPrompt } from '../src/utils/prompts';

dotenv.config();

describe('ChatgptTutor', () => {
  describe('initializeChatgptTutor', () => {
    it('should set the openaiApiKey, pineconeApiKey, and openaiClient properties', () => {
      const chatgptTutor = new ChatgptTutor();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      const pineconeApiKey = process.env.PINECONE_API_KEY as string;

      chatgptTutor.initializeChatgptTutor(openaiApiKey, pineconeApiKey);

      expect(chatgptTutor.openaiApiKey).toBe(openaiApiKey);
      expect(chatgptTutor.pineconeApiKey).toBe(pineconeApiKey);
      expect(chatgptTutor.openaiClient).toBeDefined();
    });

    it('should create a valid OpenAIApi client with the provided API key', () => {
      const chatgptTutor = new ChatgptTutor();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      const pineconeApiKey = process.env.PINECONE_API_KEY as string;

      chatgptTutor.initializeChatgptTutor(openaiApiKey, pineconeApiKey);

      expect(chatgptTutor.openaiClient).toBeInstanceOf(OpenAIApi);
      expect(chatgptTutor.openaiClient.configuration).toBeInstanceOf(
        Configuration
      );
      expect(chatgptTutor.openaiClient.configuration.apiKey).toBe(openaiApiKey);
    });
  });
  describe('generateMessageTransformer', () => {
    let chatgptTutor: ChatgptTutor;
    beforeEach(async () => {
      chatgptTutor = new ChatgptTutor();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      const pineconeApiKey = process.env.PINECONE_API_KEY as string;

      chatgptTutor.initializeChatgptTutor(openaiApiKey, pineconeApiKey);
    });
    it('should generate a valid message transformer function', async () => {
      const stringifiedGeneratedFunctionObject =
        await chatgptTutor.generateMessageTransformer(
          messageTransformMockData.baseMessages
        );

      expect(stringifiedGeneratedFunctionObject).toBeTruthy();

      const generatedTransformerFunction:
        | GeneratedTransformerFunction
        | undefined =
        chatgptTutor.chatTransformer as GeneratedTransformerFunction;

      expect(generatedTransformerFunction).toBeInstanceOf(Function);

      const transformedMessages: ChatgptMessage[] =
        messageTransformMockData.baseMessages.map((message: any) =>
          generatedTransformerFunction(
            message,
            messageTransformMockData.aiAssistantId
          )
        );

      expect(transformedMessages).toEqual(
        messageTransformMockData.transformedMessages
      );
    }, 15000);
  });

  describe('generateResponse', () => {
    let chatgptTutor: ChatgptTutor;

    beforeEach(() => {
      chatgptTutor = new ChatgptTutor();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      const pineconeApiKey = process.env.PINECONE_API_KEY as string;

      chatgptTutor.initializeChatgptTutor(openaiApiKey, pineconeApiKey);
    });

    it('should generate a response from a pre-generated chatTransformer', async () => {
      chatgptTutor.chatTransformer = generatedMessageTransformerParser(
        messageTransformMockData.generatedTransformerString
      );
      const messages = [
        {
          id: 'SuperGuy678',
          text: testPrompt,
          sender_id: 'mainGyu',
          uid: '12345',
        },
      ];

      const response = await chatgptTutor.generateResponse(
        messages,
        messageTransformMockData.aiAssistantId
      );

      const responseJson = JSON.parse(response as string);
      expect(responseJson.greeting).toBeTruthy();
      // expect responseJson.greeting to be a string
      expect(typeof responseJson.greeting).toBe('string');
    });
  });
});
