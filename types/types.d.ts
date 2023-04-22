// chatgpt input is an array of array of objects called ChatgptMessages
// ChatgptMessages is an object thhat contains a Role and content
// Role is either "user" or "assistant" and it can also be "system" but only at the beggining
type ChatgptRole = 'user' | 'assistant' | 'system';
type ChatgptMessage = {
  role: ChatgptRole;
  content: string;
};
type ChatgptMessages = ChatgptMessage[];

declare module 'openai' {
  const OpenAIApi: any;
  const Configuration: any;
  export { OpenAIApi, Configuration };
}
