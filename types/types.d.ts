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
