// lint ignore this file

import { OpenAI } from '../src/index';
import { messageTransformer, sum } from '../src/utils';

import dotenv from 'dotenv';
dotenv.config();

describe('sum', () => {
  it('adds two numbers together', () => {
    expect(sum(1, 1)).toEqual(2);
  });
});

describe('OpenAI', () => {
  it('can be instantiated', () => {
    const openai = new OpenAI('test');
    expect(openai).toBeInstanceOf(OpenAI);
  });

  it('can store an API key', () => {
    const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
    expect(openai.getApiKey()).toEqual(process.env.OPENAI_API_KEY as string);
  });

  it('can set an API key', () => {
    const openai = new OpenAI('test');
    openai.setApiKey('test2');
    expect(openai.getApiKey()).toEqual('test2');
  });
});

// create a test to check that chatgptRequest returns a ChatgptMessage
describe('chatgptRequest', () => {
  it('returns a ChatgptMessage from a single message', async () => {
    const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
    const chatgptMessage = await openai.chatgptRequest([
      {
        role: 'user',
        content: 'When did ww2 happen?',
      },
    ]);

    expect(chatgptMessage?.role).toMatch('assistant');
    expect(typeof chatgptMessage?.content).toBe('string');
  });
  it('throws an error with a specific error message when API key is invalid', async () => {
    const openai = new OpenAI('fail' as string);
    try {
      await openai.chatgptRequest([
        {
          role: 'user',
          content: 'When did ww2 happen?',
        },
      ]);
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Incorrect API key');
    }
  });
  it('throws an error with a specific error message when API key is invalid', async () => {
    const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
    try {
      await openai.chatgptRequest([]);
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('[] is too short');
    }
  });
});

// create a test to verify that a message is correctly transformed to a ChatgptMessage using messageTransformer. base it off of a message that is of type
describe('messageTransformer', () => {
  it('returns a ChatgptMessage from a dummy message', async () => {
    const chatgptMessage = messageTransformer('When did ww2 happen?', true);

    expect(chatgptMessage?.role).toMatch('user');
    expect(typeof chatgptMessage?.content).toBe('string');
  });
  // now convert a conversation array of type {userId: string, message: string, uid: string} where the userId of "thisIsUser" is the user
  it('returns a ChatgptMessages from a dummy message exchange', async () => {
    // generatea fake exchange of {userId: string, message: string, uid: string}
    const dummyMessages = [
      {
        userId: 'thisIsUser',
        message: 'When did ww2 happen?',
        uid: '1',
      },
      {
        userId: 'thisIsAssistant',
        message: 'It happened in 1945',
        uid: '2',
      },
      {
        userId: 'thisIsUser',
        message: 'I thought it happened in 1944',
        uid: '3',
      },
    ];
    const chatgptMessages = dummyMessages.map((message) =>
      messageTransformer(message.message, message.userId === 'thisIsUser')
    );

    expect(chatgptMessages[0].role).toMatch('user');
    expect(chatgptMessages[1].role).toMatch('assistant');
    expect(chatgptMessages[2].role).toMatch('user');
    expect(typeof chatgptMessages[0].content).toBe('string');
    expect(typeof chatgptMessages[1].content).toBe('string');
    expect(typeof chatgptMessages[2].content).toBe('string');
  });
});
