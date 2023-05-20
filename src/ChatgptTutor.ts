import { generateMessageTransformerPrompt } from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/generationParsers';
import { basicChatgptRequest, chatgptErrorResolver } from './utils/openaiApi';
import { OpenaiAbstraction } from './OpenaiAbstraction';

export class ChatgptTutor extends OpenaiAbstraction {
  pineconeApiKey: string;
  chatTransformer: string | object;

  constructor() {
    super();
    this.pineconeApiKey = '';
    this.chatTransformer = '';
  }

  initializeChatgptTutor(openaiApiKey: string, pineconeApiKey: string): void {
    this.initializeOpenaiAbstraction(openaiApiKey);
    this.pineconeApiKey = pineconeApiKey;
  }

  generateResponse(messages: any[], aiAssistantId: string): ChatgptMessage[] {
    // Implementation of generateResponse method goes here
    return [];
  }

  generateMessageParser(messages: any[]): string {
    // Implementation of generateMessageParser method goes here
    return '';
  }

  async generateMessageTransformer(messages: any[]): Promise<string> {
    const stringifiedMessageInputInstance = JSON.stringify(messages[0]);
    const prompt = generateMessageTransformerPrompt(
      stringifiedMessageInputInstance
    );

    const generatedString = await this.basicChatgptRequest(prompt);
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
        const truncatedError = error.toString().substring(0, 200);
        const fixedGeneratedString = await this.chatgptErrorResolver(
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
          'Failed to generate message transformer function. Please create your own function that transforms a single message to be of type `ChatgptMessage`, then assign it to the property `chatTransformer`.'
        );
      }
    }

    return generatedString;
  }
}
