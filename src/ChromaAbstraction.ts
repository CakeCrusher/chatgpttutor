import { ChromaClient, OpenAIEmbeddingFunction, Collection } from 'chromadb';
import { positionInCourseParser } from './utils/parsers';
import { batchString } from './utils/misc';

export class ChromaAbstraction {
  chromaClient: ChromaClient | undefined;
  courseCollection: Collection | undefined;
  collectionName: string | undefined;

  constructor() {
    this.chromaClient = undefined;
    this.courseCollection = undefined;
    this.collectionName = undefined;
  }

  async initializeChromaAbstraction(
    openaiApiKey: string,
    collectionName: string = 'course-collection'
  ): Promise<void> {
    this.collectionName = collectionName;
    this.chromaClient = new ChromaClient();
    const embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: openaiApiKey,
    });
    this.courseCollection = await this.chromaClient.getOrCreateCollection({
      name: collectionName,
      embeddingFunction,
    });
  }

  async addCourseSegment(
    contentInSequence: string[],
    positionInCourse: number[],
    batchSize: number = 60
  ): Promise<number> {
    if (!this.courseCollection) {
      throw new Error('Course collection not initialized');
    }

    const overlap = Math.max(4, Math.ceil(batchSize * 0.2));
    const upsertInfo: UpsertInfo = {
      ids: [],
      metadatas: [],
      documents: [],
    };
    let currentPosition = 0;
    for (let i = 0; i < contentInSequence.length; i++) {
      const courseSegments: string[] = batchString(
        contentInSequence[i],
        overlap,
        batchSize
      );
      for (let j = 0; j < courseSegments.length; j++) {
        const currentPositionInCourse =
          positionInCourse.concat(currentPosition);
        const parsedCurrentPositionInCourse = positionInCourseParser(
          currentPositionInCourse
        );
        upsertInfo.ids.push(parsedCurrentPositionInCourse.toString());
        upsertInfo.metadatas.push({
          positionInCourse: parsedCurrentPositionInCourse,
        });
        upsertInfo.documents.push(courseSegments[j]);
        currentPosition += 1;
      }
    }

    await this.courseCollection.upsert(upsertInfo);

    return upsertInfo.ids.length;
  }

  async queryRelatedCourseMaterial(
    query: string,
    amount: number = 3,
    positionInCourse: number[] | null = null
  ): Promise<string[] | null> {
    if (!this.courseCollection) {
      throw new Error('Course collection not initialized');
    }

    let whereCondition = {};
    if (positionInCourse) {
      whereCondition = {
        positionInCourse: { $lte: positionInCourseParser(positionInCourse) },
      };
    }
    const results = await this.courseCollection.query({
      n_results: amount,
      query_text: [query],
      where: whereCondition,
    });

    const resultDocuments = results.documents[0] as unknown as string[];
    return resultDocuments;
  }
}
