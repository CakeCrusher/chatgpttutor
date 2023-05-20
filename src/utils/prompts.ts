/* eslint-disable prettier/prettier */
export const generateMessageTransformerPrompt = (strigifiedMessageInputInstance: string) => {
  return `
  Your task is to create a javascript single line arrow function as a string that is passed two inputs: 'message' (object representing a message instance) and 'aiAssistantId' (string representing the id that will determine if the role of the user who wrote the message should be is "assistant" or "user").
  The javascript function will transform the message into an object of type ChatgptMessage.
  Your response will be in JSON format containing a single key-value pair of the 'javascriptFunction' to the javascript function that you create.
  Both the input example and the ChatgptTutor typing are delimited by triple backticks.
  Input example:
  \`\`\`
  ${strigifiedMessageInputInstance}
  \`\`\`
  ChatgptTutor typing:
  \`\`\`
  type ChatgptRole = 'user' | 'assistant' | 'system';
  type ChatgptMessage = {
    role: ChatgptRole;
    content: string;
  };
  \`\`\`
  `
}

export const errorResolutionPrompt = (error: string) => {
  return `
  After trying what what you reccomended it did not work. Your task is to correct yourself to fix the error.
  Your response will be in the same format as the previous response.
  The error is is delimited by triple backticks.
  \`\`\`
  ${error}
  \`\`\`
  `
}