import { Configuration, OpenAIApi } from 'openai';

export class OpenAI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async chatgptRequest(
    ChatgptMessages: ChatgptMessages
  ): Promise<ChatgptMessage | undefined> {
    const configuration = new Configuration({
      apiKey: this.apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: ChatgptMessages,
    });

    return (completion.data.choices[0].message as ChatgptMessage) || undefined;
  }
}
