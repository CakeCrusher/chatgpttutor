import dotenv from 'dotenv';
import { ChromaAbstraction } from '../src/ChromaAbstraction';
import { chromaAbstractionMockData } from '../src/utils/mockData';
import { functionRepeater } from '../src/utils/misc';

dotenv.config();

describe('ChromaAbstraction', () => {
  let chromaAbstraction: ChromaAbstraction;
  const collectionName = 'chromaCollection';

  beforeEach(async () => {
    chromaAbstraction = new ChromaAbstraction();
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not defined in .env');
    }
    await chromaAbstraction.initializeChromaAbstraction(
      openaiApiKey,
      collectionName
    );
    if (!chromaAbstraction.courseCollection) {
      throw new Error('chromaClient not defined');
    }
  });

  afterEach(async () => {
    if (!chromaAbstraction.chromaClient) {
      throw new Error('chromaClient not defined');
    }
    if (!chromaAbstraction.courseCollection) {
      throw new Error('chromaClient not defined');
    }
    await chromaAbstraction.chromaClient.deleteCollection({
      name: chromaAbstraction.courseCollection.name,
    });
  });

  describe('initializeChromaAbstraction', () => {
    test('should create a ChromaClient and courseCollection', () => {
      expect(chromaAbstraction.chromaClient).toBeDefined();
      expect(chromaAbstraction.courseCollection).toBeDefined();
      expect(chromaAbstraction.courseCollection!.name).toBe(collectionName);
    });
  });

  describe('addCourseSegment', () => {
    test('should upsert items to the courseCollection with proper batching and positionInCourse', async () => {
      const numberOfUpsertedItems = await chromaAbstraction.addCourseSegment(
        chromaAbstractionMockData.contentInSequence,
        chromaAbstractionMockData.positionInCourseToAddSequence,
        chromaAbstractionMockData.batchSize
      );

      expect(numberOfUpsertedItems).toBe(
        chromaAbstractionMockData.expectedBatchedDocuments.length
      ); // Expect 5 documents to be upserted

      // Query the courseCollection to ensure the expected documents are present

      if (!chromaAbstraction.courseCollection) {
        throw new Error('chromaClient not defined');
      }

      const queryResult = await chromaAbstraction.courseCollection.get({
        where: {},
      });

      chromaAbstractionMockData.expectedBatchedDocuments.forEach(
        (expectedDocument) => {
          expect(queryResult.documents).toContain(expectedDocument);
        }
      );

      chromaAbstractionMockData.expectedBatchedMetadatas.forEach(
        (expectedMetadata) => {
          expect(queryResult.metadatas).toContainEqual(expectedMetadata);
        }
      );
    });
  });

  describe('queryRelatedCourseMaterial', () => {
    test('should return the expected related course material documents based on the query and positionInCourse', async () => {
      await chromaAbstraction.addCourseSegment(
        chromaAbstractionMockData.contentInSequence,
        chromaAbstractionMockData.positionInCourseToAddSequence,
        chromaAbstractionMockData.batchSize
      );

      // Query related course material
      const query = '7 8 9'; // does not matter
      const amount = 5;
      const resultDocuments =
        await chromaAbstraction.queryRelatedCourseMaterial(
          query,
          amount,
          chromaAbstractionMockData.positionInCourseQuery
        );

      chromaAbstractionMockData.expectedBatchedQueryDocuments.forEach(
        (expectedDocument) => {
          expect(resultDocuments).toContainEqual(expectedDocument);
        }
      );
    });
  });
});
