import { generateMessageTransformerPrompt } from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/parsers';
import { OpenaiAbstraction } from './OpenaiAbstraction';

export class ChatgptTutor extends OpenaiAbstraction {
  pineconeApiKey: string | undefined;
  chatTransformer: GeneratedTransformerFunction | undefined;

  constructor() {
    super();
    this.pineconeApiKey = undefined;
    this.chatTransformer = undefined;
  }

  initializeChatgptTutor(openaiApiKey: string, pineconeApiKey: string): void {
    this.initializeOpenaiAbstraction(openaiApiKey);
    this.pineconeApiKey = pineconeApiKey;
  }

  async generateResponse(
    messages: any[],
    aiAssistantId: string
  ): Promise<string> {
    if (!this.chatTransformer) {
      const messageTransformerObj = await this.generateMessageTransformer(
        messages
      );
      console.log(
        'This is you generated message transformer object:\n',
        messageTransformerObj
      );
    }
    const transformedMessages: ChatgptMessage[] = messages.map(
      (message: any) =>
        this.chatTransformer?.(message, aiAssistantId) as ChatgptMessage
    );

    const completion = await this.openaiClient.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: transformedMessages,
    });
    return completion.data.choices[0]?.message?.content;
  }

  async generateMessageTransformer(messages: any[]): Promise<string> {
    const stringifiedMessageInputInstance = JSON.stringify(messages[0]);
    const prompt = generateMessageTransformerPrompt(
      stringifiedMessageInputInstance
    );

    // first attempt at generating message transformer
    let generatedString = await this.basicChatgptRequest(prompt);
    if (!generatedString) {
      throw new Error('Failed to generate message parser');
    }
    console.log('generatedString:\n', generatedString);

    try {
      const generatedTransformerFunction: GeneratedTransformerFunction =
        generatedMessageTransformerParser(generatedString);

      this.chatTransformer = generatedTransformerFunction;
    } catch (error: any) {
      // second attempt to generate message transformer with chatgptErrorResolver
      console.warn(
        'Failed to generate first transformer function with error:',
        error
      );
      try {
        let truncatedError = error.toString().substring(0, 200);
        if (error.message) {
          truncatedError = error.message.substring(0, 200);
        }
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
        generatedString = fixedGeneratedString;
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
