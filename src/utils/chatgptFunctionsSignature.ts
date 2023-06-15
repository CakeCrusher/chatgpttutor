
export const messageTransformer: ChatgptFunctionSignature = {
  "name": "message_transformer",
  "description": `Creates a javascript single line arrow function as a string that transforms a message of unknown type to a message of type type ChatgptMessage of type
  \`\`\`
  type ChatgptMessage = {
    role: ChatgptRole;
    content: string;
  };
  \`\`\`
  `,
  "parameters": {
    "type": "object",
    "properties": {
      "stringified_messages": {
        "type": "string",
        "description": "Messages of unknown type that will be transformed to messages of type ChatgptMessage of type `{ role: ChatgptRole; content: string; };`",
      }
    },
    "required": ["stringified_messages"]
  }
}