import { Configuration, OpenAIApi } from 'openai';
import { errorResolutionPrompt } from './utils/prompts';

export class OpenaiAbstraction {
  openaiApiKey: string | undefined;
  openaiClient: any;

  constructor() {
    this.openaiApiKey = undefined;
    this.openaiClient = undefined;
  }

  initializeOpenaiAbstraction(openaiApiKey: string): void {
    this.openaiApiKey = openaiApiKey;
    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    this.openaiClient = new OpenAIApi(configuration);
  }

  async basicChatgptRequest(prompt: string): Promise<string | undefined> {
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];
    const completion = await this.openaiClient.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
    return completion.data.choices[0]?.message?.content || undefined;
  }

  async chatgptErrorResolver(
    prompt: string,
    result: string,
    error: string
  ): Promise<string | undefined> {
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
    const completion = await this.openaiClient.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
    return (completion.data.choices[0].message.content as string) || undefined;
  }
}
