import { errorResolutionPrompt } from './prompts';

export const basicChatgptRequest = async (
  openaiClient: any,
  prompt: string
): Promise<string | undefined> => {
  const messages = [
    {
      role: 'user',
      content: prompt,
    },
  ];
  const completion = await openaiClient.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  });
  return (completion.data.choices[0].message.content as string) || undefined;
};

export const chatgptErrorResolver = async (
  openaiClient: any,
  prompt: string,
  result: string,
  error: string
): Promise<string | undefined> => {
  const messages = [
    {
      role: 'user',
      content: prompt,
    },
    {
      role: 'assistant',
      content: result,
    },
    {
      role: 'user',
      content: errorResolutionPrompt(error),
    },
  ];
  const completion = await openaiClient.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  });
  return (completion.data.choices[0].message.content as string) || undefined;
};
