import { sum } from '../src/index';
import { OpenAI } from '../src/index';

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
