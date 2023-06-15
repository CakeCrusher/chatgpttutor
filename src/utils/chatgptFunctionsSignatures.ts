export const messageTransformerSignature: ChatgptFunctionSignature = {
  name: 'message_transformer',
  description: `Parses a stringified javascript function to transform a message of unknown schema into an object of type ChatgptMessage delimited by triple backticks.
  \`\`\`
  type ChatgptRole = 'user' | 'assistant' | 'system';
  type ChatgptMessage = {
    role: ChatgptRole;
    content: string;
  };
  \`\`\``,
  parameters: {
    type: 'object',
    properties: {
      transformer_function: {
        type: 'string',
        description: `The stringified javascript single line arrow function that is passed two inputs: 'message' (object representing a message instance of an unknown schema) and 'aiAssistantId' (string representing the id that will determine if the role of the user who wrote the message is "assistant" or "user").
        The function will return an object of type ChatgptMessage delimited by triple backticks.
        \`\`\`
        type ChatgptRole = 'user' | 'assistant' | 'system';
        type ChatgptMessage = {
          role: ChatgptRole;
          content: string;
        };
        \`\`\``,
      },
    },
    required: ['transformer_function'],
  },
  function_call: { name: 'message_transformer' },
};
