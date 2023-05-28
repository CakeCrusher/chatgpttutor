import {
  generateMessageTransformerPrompt,
  messageWithContent,
} from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/parsers';
import { OpenaiAbstraction } from './OpenaiAbstraction';
import { ChromaAbstraction } from './ChromaAbstraction';

export class ChatgptTutor extends OpenaiAbstraction {
  pineconeApiKey: string | undefined;
  chatTransformer: GeneratedTransformerFunction | undefined;
  vectorDb: VectorDb | undefined;

  constructor() {
    super();
    this.pineconeApiKey = undefined;
    this.chatTransformer = undefined;
    this.vectorDb = undefined;
  }

  async initializeChatgptTutor(
    openaiApiKey: string,
    pineconeApiKey: string
  ): Promise<void> {
    this.initializeOpenaiAbstraction(openaiApiKey);
    this.pineconeApiKey = pineconeApiKey;
    const chromaAbstraction = new ChromaAbstraction();
    await chromaAbstraction.initializeChromaAbstraction(openaiApiKey);
    this.vectorDb = chromaAbstraction;
  }

  async generateResponse(
    messages: any[],
    aiAssistantId: string,
    positionInCourse: number[] | null = null,
    amountOfCourseContext: number | null = null
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

    // if positionInCourse is not null then edit the last message in transformedMessages to have the positionInCourse
    if (this.vectorDb && positionInCourse && amountOfCourseContext) {
      // get relevant course material from vectorDb
      const courseMaterial = await this.vectorDb.queryRelatedCourseMaterial(
        transformedMessages[transformedMessages.length - 1].content,
        amountOfCourseContext,
        positionInCourse
      );
      if (courseMaterial) {
        const newFinalMessageContent = messageWithContent(
          transformedMessages[transformedMessages.length - 1].content,
          courseMaterial
        );
        transformedMessages[transformedMessages.length - 1].content =
          newFinalMessageContent;
      }
    }

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
