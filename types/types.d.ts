type ChatgptRole = 'user' | 'assistant' | 'system';
type ChatgptMessage = {
  role: ChatgptRole;
  content: string;
};

type GeneratedTransformerFunction = (
  message: any,
  aiAssistantId: string
) => ChatgptMessage;

type InputPathsToChatMessage = {
  pathToRole: string[];
  pathToContent: string[];
};

declare module 'openai' {
  const OpenAIApi: any;
  const Configuration: any;
  export { OpenAIApi, Configuration };
}

type CourseSegment = {
  content: string;
  positionInCourse: number;
};

type UpsertInfo = {
  ids: string[];
  metadatas: any[];
  documents: string[];
};

type VectorDb = {
  addCourseSegment: (
    contentInSequence: string[],
    positionInCourse: number[],
    batchSize: number = 60
  ) => Promise<number>;
  queryRelatedCourseMaterial: (
    query: string,
    amount: number = 3,
    positionInCourse: number[] | null = null
  ) => Promise<string[] | null>;
  chromaClient: ChromaClient;
  courseCollection: Collection;
};

type ChatgptFunctionSignature = {
  name: string;
  description: string;
  parameters: any;
  function_call?: any;
}
