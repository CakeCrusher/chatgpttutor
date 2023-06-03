import dotenv from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';
import { ChatgptTutor, ChromaAbstraction } from '../src/index';
import {
  messageTransformMockData,
  chromaAbstractionMockData,
} from '../src/utils/mockData';
import {
  generatedMessageTransformerParser,
  markdownToJsonParser,
} from '../src/utils/parsers';
import { testPrompt } from '../src/utils/prompts';
import { functionRepeater } from '../src/utils/misc';

dotenv.config();

describe('ChatgptTutor', () => {
  let chatgptTutor: ChatgptTutor;
  let collectionName: string = 'chatgptTutorTest';
  const openaiApiKey = process.env.OPENAI_API_KEY as string;
  const pineconeApiKey = process.env.PINECONE_API_KEY as string;

  beforeEach(async () => {
    chatgptTutor = new ChatgptTutor();

    await chatgptTutor.initializeChatgptTutor(
      openaiApiKey,
      pineconeApiKey,
      collectionName
    );
  });
  afterEach(async () => {
    if (!chatgptTutor.vectorDb) {
      throw new Error('vectorDb is undefined');
    }
    if (!chatgptTutor.vectorDb.courseCollection) {
      throw new Error('courseCollection is undefined');
    }
    await chatgptTutor.vectorDb.chromaClient.deleteCollection({
      name: chatgptTutor.vectorDb.courseCollection.name,
    });
  });
  describe('initializeChatgptTutor', () => {
    test('should set the openaiApiKey, pineconeApiKey, and openaiClient properties', async () => {
      expect(chatgptTutor.openaiApiKey).toBe(openaiApiKey);
      expect(chatgptTutor.pineconeApiKey).toBe(pineconeApiKey);
      expect(chatgptTutor.openaiClient).toBeDefined();
      expect(chatgptTutor.vectorDb).toBeDefined();
      expect(chatgptTutor.vectorDb).toBeInstanceOf(ChromaAbstraction);
      if (!chatgptTutor.vectorDb) {
        throw new Error('vectorDb is undefined');
      }
      expect(chatgptTutor.vectorDb.courseCollection).toBeDefined();
      expect(chatgptTutor.vectorDb.courseCollection.name).toBe(collectionName);
    });

    test('should create a valid OpenAIApi client with the provided API key', () => {
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
    test('should generate a valid message transformer function', async () => {
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
    }, 30000);
  });

  describe('generateResponse', () => {
    test('should generate a response from a pre-generated chatTransformer', async () => {
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
    test('should generate a response from a chatTransformer without a pre-generated chatTransformer', async () => {
      const messages = [
        {
          id: 'SuperGuy678',
          text: testPrompt,
          sender_id: 'mainGyu',
          uid: '12345',
        },
      ];
      expect(chatgptTutor.chatTransformer).toBeUndefined();
      // getting first response and generating messateTransformer
      const firstResponse = await functionRepeater(async () => {
        return await chatgptTutor.generateResponse(
          messages,
          messageTransformMockData.aiAssistantId
        );
      }, 3);
      expect(chatgptTutor.chatTransformer).toBeTruthy();
      const firstResponseJson = JSON.parse(firstResponse as string);
      expect(firstResponseJson.greeting).toBeTruthy();
      expect(typeof firstResponseJson.greeting).toBe('string');

      // getting second response
      const secondResponse = await functionRepeater(async () => {
        return await chatgptTutor.generateResponse(
          messages,
          messageTransformMockData.aiAssistantId
        );
      }, 3);
      expect(chatgptTutor.chatTransformer).toBeTruthy();
      const secondResponseJson = JSON.parse(secondResponse as string);
      expect(secondResponseJson.greeting).toBeTruthy();
      expect(typeof secondResponseJson.greeting).toBe('string');
    }, 30000);
  });

  describe('queryRelatedCourseMaterial', () => {
    test('should respond with course related content', async () => {
      if (!chatgptTutor.vectorDb) {
        throw new Error('vectorDb is undefined');
      }

      chatgptTutor.chatTransformer = (
        message: ChatgptMessage,
        aiAssistantId: string
      ) => message;
      await chatgptTutor.vectorDb.addCourseSegment(
        chromaAbstractionMockData.contentInSequence,
        chromaAbstractionMockData.positionInCourseToAddSequence,
        chromaAbstractionMockData.batchSize
      );
      const messages = [
        {
          role: 'user',
          content:
            'Please respond with only a JSON object of the following format: { "largestNumber": NUMBER_HERE } where NUMBER_HERE is the largest number in the relevant content.',
        },
      ];
      const response = await chatgptTutor.generateResponse(
        messages,
        messageTransformMockData.aiAssistantId,
        chromaAbstractionMockData.positionInCourseQuery,
        5,
        0
      );

      const responseJson = JSON.parse(markdownToJsonParser(response) as string);
      expect(responseJson.largestNumber).toBe(22);
    }, 30000);
  });
});
