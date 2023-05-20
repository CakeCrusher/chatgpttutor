import { Configuration, OpenAIApi } from 'openai';
import { generateMessageTransformerPrompt } from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/generationParsers';
import { basicChatgptRequest, chatgptErrorResolver } from './utils/openaiApi';

export class ChatgptTutor {
  openaiApiKey: string | undefined;
  pineconeApiKey: string | undefined;
  chatTransformer: GeneratedTransformerFunction | undefined;
  openaiClient: any;

  constructor() {
    this.openaiApiKey = undefined;
    this.pineconeApiKey = undefined;
    this.chatTransformer = undefined;
    this.openaiClient = undefined;
  }

  init(openaiApiKey: string, pineconeApiKey: string): void {
    this.openaiApiKey = openaiApiKey;
    this.pineconeApiKey = pineconeApiKey;
    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    this.openaiClient = new OpenAIApi(configuration);
  }

  generateResponse(
    messages: ChatgptMessage[],
    aiAssistantId: string
  ): ChatgptMessage[] {
    // Implementation of generateResponse method goes here
    return [];
  }

  async generateMessageTransformer(
    messages: ChatgptMessage[]
  ): Promise<string> {
    // attempt to generate function on first try
    const stringifiedMessageInputInstance = JSON.stringify(messages[0]);
    const prompt = generateMessageTransformerPrompt(
      stringifiedMessageInputInstance
    );

    const generatedString = await basicChatgptRequest(
      this.openaiClient,
      prompt
    );
    if (!generatedString) {
      throw new Error('Failed to generate message parser');
    }
    console.log('generatedString:\n', generatedString);

    try {
      const generatedTransformerFunction: GeneratedTransformerFunction =
        generatedMessageTransformerParser(generatedString);

      this.chatTransformer = generatedTransformerFunction;
    } catch (error: any) {
      console.warn(
        'Failed to generate first transformer function with error:',
        error
      );
      try {
        // truncated error to 200 characters
        const truncatedError = error.toString().substring(0, 200);
        const fixedGeneratedString = await chatgptErrorResolver(
          this.openaiClient,
          prompt,
          generatedString,
          truncatedError
        );
        if (!fixedGeneratedString) {
          throw new Error('Failed to generate message parser');
        }
        const generatedTransformerFunction: GeneratedTransformerFunction =
          generatedMessageTransformerParser(fixedGeneratedString);

        this.chatTransformer = generatedTransformerFunction;
      } catch (error: any) {
        console.error(error);
        throw new Error(
          'Failed to generate message transformer function. Plese create your own function that transforms a single message to be of type `ChatgptMessage`, then assign it to the property `chatTransformer`.'
        );
      }
    }

    return generatedString;
  }
}
