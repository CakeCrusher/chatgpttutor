import dotenv from 'dotenv';
import { ChromaAbstraction } from '../src/ChromaAbstraction';
import { chromaAbstractionMockData } from '../src/utils/mockData';

dotenv.config();

describe('ChromaAbstraction', () => {
  let chromaAbstraction: ChromaAbstraction;

  beforeEach(async () => {
    chromaAbstraction = new ChromaAbstraction();
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not defined in .env');
    }
    await chromaAbstraction.initializeChromaAbstraction(openaiApiKey);
    if (!chromaAbstraction.courseCollection) {
      throw new Error('chromaClient not defined');
    }
    await chromaAbstraction.courseCollection.delete({
      where: {},
    });
  });

  describe('initializeChromaAbstraction', () => {
    it('should create a ChromaClient and courseCollection', () => {
      expect(chromaAbstraction.chromaClient).toBeDefined();
      expect(chromaAbstraction.courseCollection).toBeDefined();
      expect(chromaAbstraction.courseCollection!.name).toBe(
        'course-collection'
      );
    });
  });

  describe('addCourseSegment', () => {
    it('should upsert items to the courseCollection with proper batching and positionInCourse', async () => {
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

      const queryResult = await chromaAbstraction.courseCollection.query({
        n_results: 5,
        query_text: ['one'], // does not matter
      });

      chromaAbstractionMockData.expectedBatchedDocuments.forEach(
        (expectedDocument) => {
          expect(queryResult.documents[0]).toContainEqual(expectedDocument);
        }
      );

      chromaAbstractionMockData.expectedBatchedMetadatas.forEach(
        (expectedDocument) => {
          expect(queryResult.metadatas[0]).toContainEqual(expectedDocument);
        }
      );
    });
  });

  describe('queryRelatedCourseMaterial', () => {
    it('should return the expected related course material documents based on the query and positionInCourse', async () => {
      await chromaAbstraction.addCourseSegment(
        chromaAbstractionMockData.contentInSequence,
        chromaAbstractionMockData.positionInCourseToAddSequence,
        chromaAbstractionMockData.batchSize
      );

      // Query related course material
      const query = 'numbers'; // does not matter
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
