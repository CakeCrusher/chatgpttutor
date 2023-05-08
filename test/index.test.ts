// lint ignore this file

import { PineconeClient } from '@pinecone-database/pinecone';
import { QueryResponse } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

import { OpenAI, Pinecone } from '../src/index';
import { messageTransformer, sum } from '../src/utils';
import { TextEmbedding } from '../src/api/pinecone';

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

// create a series of tests that test all of the functions within Pinecone class
describe('Pinecone', () => {
  const indexName = 'test-index-chatgpttutor';
  let pineconeObj: Pinecone;
  let pinecone: PineconeClient;
  let embeddings: TextEmbedding[];
  const texts = [
    'When did ww2 happen?',
    'Water is not an element.',
    'It is raining outside, what element is it raining?',
  ];

  beforeEach(async () => {
    pineconeObj = new Pinecone(process.env.PINECONE_API_KEY as string);
    pinecone = new PineconeClient();
    try {
      await pinecone.init({
        environment: pineconeObj.getEnvironment(),
        apiKey: pineconeObj.getApiKey(),
      });
    } catch (error) {
      console.error(error);
    }
  });

  it('can be instantiated', () => {
    const pinecone = new Pinecone('test');
    expect(pinecone).toBeInstanceOf(Pinecone);
  });
  it('can store an API key', () => {
    const pinecone = new Pinecone(process.env.PINECONE_API_KEY as string);
    expect(pinecone.getApiKey()).toEqual(
      process.env.PINECONE_API_KEY as string
    );
  });
  it('can create an index', async () => {
    try {
      await pineconeObj.createIndex(indexName);
    } catch (error) {
      console.error(error);
    }
    const indexes = await pinecone.listIndexes();
    expect(indexes).toContain(indexName);
    // wait 4 minutes for the index to be created
    await new Promise((resolve) => setTimeout(resolve, 240000));
  }, 250000);
  it('can create an embedding', async () => {
    const embeddingsRes = await pineconeObj.createEmbeddings(
      texts,
      process.env.OPENAI_API_KEY as string
    );
    // log the embeddings but only the first 4 ininstances of each embedding
    console.log(
      embeddingsRes.map((embedding) => embedding.embedding.slice(0, 4))
    );
    expect(embeddingsRes).toBeDefined();
    // expect the embeddings to be of length 2
    expect(embeddingsRes[0].text).toMatch(texts[0]);
    embeddingsRes[0].embedding.slice(0, 4).forEach((num, idx) => {
      expect(num).toBeCloseTo(
        [-0.01806006, -0.03896703, 0.0041019595, -0.020690907][idx],
        3
      );
    });
    expect(embeddingsRes[1].text).toMatch(texts[1]);
    embeddingsRes[1].embedding.slice(0, 4).forEach((num, idx) => {
      expect(num).toBeCloseTo(
        [-0.00075834506, 0.008689289, 0.0068192026, -0.011818692][idx],
        3
      );
    });
    embeddings = embeddingsRes;
  });
  it('can add embeddings to an index', async () => {
    try {
      await pineconeObj.upsertEmbeddings(indexName, embeddings);
    } catch (error) {
      console.error(error);
    }
    const index = await pinecone.Index(indexName);
    const queryText = 'Is water on the periodic table?';
    const embeddingsRes = await pineconeObj.createEmbeddings(
      [queryText],
      process.env.OPENAI_API_KEY as string
    );
    const queryEmbedding = embeddingsRes[0].embedding;
    const queryRequest = {
      vector: queryEmbedding,
      topK: 2,
      includeValues: true,
      includeMetadata: true,
    };
    let queryResults: QueryResponse | undefined;
    console.log('pre queryResults');
    try {
      queryResults = await index.query({ queryRequest });
    } catch (error) {
      console.error('QUERY ERROR: ', error);
    }

    expect(queryResults).toBeDefined();
    expect(queryResults!.matches).toBeDefined();
    expect(queryResults!.matches![0].id).toEqual(texts[1]);
    expect(queryResults!.matches![1].id).toEqual(texts[2]);
  });

  it('can delete an index', async () => {
    try {
      await pineconeObj.deleteIndex(indexName);
    } catch (error) {
      console.error(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const indexesAfterDelete = await pinecone.listIndexes();
    expect(indexesAfterDelete).not.toContain(indexName);
  }, 20000);
});
