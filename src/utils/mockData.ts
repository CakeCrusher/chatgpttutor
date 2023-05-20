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
  '{\n  "javascriptFunction": "(message, aiAssistantId) => ({role: message.sender_id === aiAssistantId ? \'assistant\' : \'user\', content: message.text})"\n}';
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
