const errorResolverResult = `{
  "greeting"= "Hello, and welcome!"
}`;

const errorResolverError =
  'Uncaught SyntaxError: Unexpected token = in JSON at position 11';

export const openaiAbstractionMockData = {
  errorResolverResult,
  errorResolverError,
};

const baseMessages: any = [
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
const generatedTransformerString: string =
  '{\n  "transformer_function": "(message, aiAssistantId) => ({role: message.sender_id === aiAssistantId ? \'assistant\' : \'user\', content: message.text})"\n}';
const transformedMessages: ChatgptMessage[] = [
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
const aiAssistantId = 'otherGui';

export const messageTransformMockData = {
  baseMessages,
  generatedTransformerString,
  transformedMessages,
  aiAssistantId,
};

const contentInSequence = [
  '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34',
];

const positionInCourseToAddSequence = [1, 10, 0];

const batchSize = 10;

const expectedBatchedDocuments = [
  '1 2 3 4 5 6 7 8 9 10',
  '7 8 9 10 11 12 13 14 15 16',
  '13 14 15 16 17 18 19 20 21 22',
  '19 20 21 22 23 24 25 26 27 28',
  '25 26 27 28 29 30 31 32 33 34',
];

const expectedBatchedMetadatas = [
  {
    positionInCourse: 1010000000000,
  },
  {
    positionInCourse: 1010000001000,
  },
  {
    positionInCourse: 1010000002000,
  },
  {
    positionInCourse: 1010000003000,
  },
  {
    positionInCourse: 1010000004000,
  },
];

const positionInCourseQuery = [1, 10, 0, 2];

const expectedBatchedQueryDocuments = [
  '1 2 3 4 5 6 7 8 9 10',
  '7 8 9 10 11 12 13 14 15 16',
  '13 14 15 16 17 18 19 20 21 22',
];

export const chromaAbstractionMockData = {
  contentInSequence,
  positionInCourseToAddSequence,
  batchSize,
  expectedBatchedDocuments,
  expectedBatchedMetadatas,
  positionInCourseQuery,
  expectedBatchedQueryDocuments,
};
