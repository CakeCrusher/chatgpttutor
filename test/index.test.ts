import dotenv from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';
import { ChatgptTutor } from '../src/index';
import { sum } from '../src/utils';

dotenv.config();

describe('sum', () => {
  it('adds two numbers together', () => {
    expect(sum(1, 1)).toEqual(2);
  });
});

describe('ChatgptTutor', () => {
  describe('init', () => {
    it('should set the openaiApiKey, pineconeApiKey, and openaiClient properties', () => {
      const chatgptTutor = new ChatgptTutor();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      const pineconeApiKey = process.env.PINECONE_API_KEY as string;

      chatgptTutor.init(openaiApiKey, pineconeApiKey);

      expect(chatgptTutor.openaiApiKey).toBe(openaiApiKey);
      expect(chatgptTutor.pineconeApiKey).toBe(pineconeApiKey);
      expect(chatgptTutor.openaiClient).toBeInstanceOf(OpenAIApi);
    });

    it('should create a valid OpenAIApi client with the provided API key', () => {
      const chatgptTutor = new ChatgptTutor();
      const openaiApiKey = process.env.OPENAI_API_KEY as string;
      const pineconeApiKey = process.env.PINECONE_API_KEY as string;

      chatgptTutor.init(openaiApiKey, pineconeApiKey);

      expect(chatgptTutor.openaiClient.configuration).toBeInstanceOf(
        Configuration
      );
      expect(chatgptTutor.openaiClient.configuration.apiKey).toBe(openaiApiKey);
    });
    describe('generateMessageTransformer', () => {
      let chatgptTutor: ChatgptTutor;
      beforeEach(async () => {
        chatgptTutor = new ChatgptTutor();
        const openaiApiKey = process.env.OPENAI_API_KEY as string;
        const pineconeApiKey = process.env.PINECONE_API_KEY as string;

        chatgptTutor.init(openaiApiKey, pineconeApiKey);
      });
      it('should generate a valid message transformer function', async () => {
        const messages: any = [
          {
            id: 'SuperGuy678',
            text: 'Hello, how are you doing',
            sender_id: 'mainGyu',
            uid: '12345',
          },
          {
            id: 'SuperGuy678',
            text: 'doin well',
            sender_id: 'otherGui',
            uid: '12345',
          },
          {
            id: 'SuperGuy678',
            text: 'Great to hear!',
            sender_id: 'mainGyu',
            uid: '12345',
          },
        ];
        const evalTransformedMessages: ChatgptMessage[] = [
          {
            role: 'user',
            content: 'Hello, how are you doing',
          },
          {
            role: 'assistant',
            content: 'doin well',
          },
          {
            role: 'user',
            content: 'Great to hear!',
          },
        ];
        const evalAiAssistantId = 'otherGui';

        const stringifiedGeneratedFunctionObject =
          await chatgptTutor.generateMessageTransformer(messages);

        expect(stringifiedGeneratedFunctionObject).toBeTruthy();

        const generatedTransformerFunction:
          | GeneratedTransformerFunction
          | undefined =
          chatgptTutor.chatTransformer as GeneratedTransformerFunction;

        expect(generatedTransformerFunction).toBeInstanceOf(Function);

        const transformedMessages: ChatgptMessage[] = messages.map(
          (message: any) =>
            generatedTransformerFunction(message, evalAiAssistantId)
        );

        expect(transformedMessages).toEqual(evalTransformedMessages);
      }, 15000);

      // it('should throw an error if message transformer generation fails', async () => {
      //   const messages: ChatgptMessage[] = [
      //     {
      //       role: 'user',
      //       content: 'Hello',
      //     },
      //   ];

      //   // Mocking a failure response from the AI model
      //   jest
      //     .spyOn(chatgptTutor, '#basicChatgptRequest')
      //     .mockResolvedValue(undefined);

      //   await expect(
      //     chatgptTutor.generateMessageTransformer(messages)
      //   ).rejects.toThrow('Failed to generate message parser');
      // });
    });
  });
});

// describe('OpenAI', () => {
//   it('can be instantiated', () => {
//     const openai = new OpenAI('test');
//     expect(openai).toBeInstanceOf(OpenAI);
//   });

//   it('can store an API key', () => {
//     const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
//     expect(openai.getApiKey()).toEqual(process.env.OPENAI_API_KEY as string);
//   });

//   it('can set an API key', () => {
//     const openai = new OpenAI('test');
//     openai.setApiKey('test2');
//     expect(openai.getApiKey()).toEqual('test2');
//   });
// });

// // create a test to check that chatgptRequest returns a ChatgptMessage
// describe('chatgptRequest', () => {
//   it('returns a ChatgptMessage from a single message', async () => {
//     const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
//     const chatgptMessage = await openai.chatgptRequest([
//       {
//         role: 'user',
//         content: 'When did ww2 happen?',
//       },
//     ]);

//     expect(chatgptMessage?.role).toMatch('assistant');
//     expect(typeof chatgptMessage?.content).toBe('string');
//   });
//   it('throws an error with a specific error message when API key is invalid', async () => {
//     const openai = new OpenAI('fail' as string);
//     try {
//       await openai.chatgptRequest([
//         {
//           role: 'user',
//           content: 'When did ww2 happen?',
//         },
//       ]);
//     } catch (error: any) {
//       expect(error).toBeDefined();
//       expect(error.message).toContain('Incorrect API key');
//     }
//   });
//   it('throws an error with a specific error message when API key is invalid', async () => {
//     const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
//     try {
//       await openai.chatgptRequest([]);
//     } catch (error: any) {
//       expect(error).toBeDefined();
//       expect(error.message).toContain('[] is too short');
//     }
//   });
// });

// // create a test to verify that a message is correctly transformed to a ChatgptMessage using messageTransformer. base it off of a message that is of type
// describe('messageTransformer', () => {
//   it('returns a ChatgptMessage from a dummy message', async () => {
//     const chatgptMessage = messageTransformer('When did ww2 happen?', true);

//     expect(chatgptMessage?.role).toMatch('user');
//     expect(typeof chatgptMessage?.content).toBe('string');
//   });
//   // now convert a conversation array of type {userId: string, message: string, uid: string} where the userId of "thisIsUser" is the user
//   it('returns a ChatgptMessages from a dummy message exchange', async () => {
//     // generatea fake exchange of {userId: string, message: string, uid: string}
//     const dummyMessages = [
//       {
//         userId: 'thisIsUser',
//         message: 'When did ww2 happen?',
//         uid: '1',
//       },
//       {
//         userId: 'thisIsAssistant',
//         message: 'It happened in 1945',
//         uid: '2',
//       },
//       {
//         userId: 'thisIsUser',
//         message: 'I thought it happened in 1944',
//         uid: '3',
//       },
//     ];
//     const chatgptMessages = dummyMessages.map((message) =>
//       messageTransformer(message.message, message.userId === 'thisIsUser')
//     );

//     expect(chatgptMessages[0].role).toMatch('user');
//     expect(chatgptMessages[1].role).toMatch('assistant');
//     expect(chatgptMessages[2].role).toMatch('user');
//     expect(typeof chatgptMessages[0].content).toBe('string');
//     expect(typeof chatgptMessages[1].content).toBe('string');
//     expect(typeof chatgptMessages[2].content).toBe('string');
//   });
// });
