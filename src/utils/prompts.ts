export const requestForMessageTransformer = (
  stringifiedMessageInputInstance: string
) => `Please create a function to transform the message example delimited by triple backticks into a message of ChatgptMessage schema.
\`\`\`
${stringifiedMessageInputInstance}
\`\`\``;

export const errorResolutionPrompt = (error: string) => {
  return `
  After trying what what you reccomended it did not work. Your task is to correct yourself to fix the error.
  Your response will be in the same format as the previous response.
  The error is is delimited by triple backticks.
  \`\`\`
  ${error}
  \`\`\`
  `;
};

export const testPrompt = `
Your task is to produce a greeting in the following JSON format:
\`\`\`
{
  "greeting": GREETING_STRING_HERE
}
\`\`\`
`;

export const messageWithContent = (
  message: string,
  contents: string[]
): string => {
  // transform list of contents into an enumerated list string
  const enumeratedContents = contents
    .map((content, index) => {
      return `${index + 1}. ${content}`;
    })
    .join('\n');

  return `
  Your task is to generate a response to the message delimited by triple backticks using the related content also delimited with triple backticks.
  The related content is formatted in order of relevance.
  Below is the related content:
  \`\`\`
  ${enumeratedContents}
  \`\`\`
  Below is the message:
  \`\`\`
  ${message}
  \`\`\`
  `;
};
