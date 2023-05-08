import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIApi } from 'openai';
import { Vector } from '@pinecone-database/pinecone';

export interface TextEmbedding {
  text: string;
  embedding: number[];
}

interface UpsertOperationRequest {
  vectors: Vector[];
}

// create a class called Pinecone that when initialized it takes in an API key
export class Pinecone {
  private apiKey: string;
  private environment: string = 'us-west4-gcp';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public setEnvironment(environment: string): void {
    this.environment = environment;
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public async createIndex(
    indexName: string,
    dimension: number = 1536,
    metric: string = 'cosine'
  ): Promise<any> {
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: this.environment,
      apiKey: this.apiKey,
    });
    await pinecone.createIndex({
      createRequest: {
        metric,
        name: indexName,
        dimension,
      },
    });
  }

  public async createEmbeddings(
    texts: string[],
    OpenaiApiKey: string
  ): Promise<TextEmbedding[]> {
    // create a post request to https://api.openai.com/v1/embeddings with a body that includes and input and a model
    const embed = async (text: string): Promise<number[]> => {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OpenaiApiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002',
        }),
      });
      const json = await res.json();
      return json.data[0].embedding;
    };

    // run all of the promises in parallel for texts make sure they are returned in the same order
    const embeddings = await Promise.all(texts.map(embed));
    // return an array of tuples with the text and the embedding
    const textEmbeddingTuples: TextEmbedding[] = texts.map((text, index) => {
      return {
        text,
        embedding: embeddings[index],
      };
    });

    return textEmbeddingTuples;
  }

  public async upsertEmbeddings(
    indexName: string,
    textEmbeddingTuples: TextEmbedding[]
  ): Promise<any> {
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: this.environment,
      apiKey: this.apiKey,
    });
    const index = pinecone.Index(indexName);
    const upsertRequest: UpsertOperationRequest = {
      vectors: textEmbeddingTuples.map(({ text, embedding }) => {
        return {
          id: text,
          values: embedding,
        };
      }),
    };
    console.log(
      'upsertRequest:',
      upsertRequest.vectors[0].values.length,
      upsertRequest
    );
    await index.upsert({ upsertRequest });
  }

  public async deleteIndex(
    indexName: string,
    pineconeApiKey: string = this.apiKey
  ): Promise<any> {
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: this.environment,
      apiKey: pineconeApiKey,
    });
    await pinecone.deleteIndex({
      indexName: indexName,
    });
  }
}
