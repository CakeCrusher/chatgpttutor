import {
  messageWithContent,
  requestForMessageTransformer,
} from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/parsers';
import { OpenaiAbstraction } from './OpenaiAbstraction';
import { ChromaAbstraction } from './ChromaAbstraction';
import { messageTransformerSignature } from './utils/chatgptFunctionsSignatures';

export class ChatgptTutor extends OpenaiAbstraction {
  chatTransformer: GeneratedTransformerFunction | undefined;
  vectorDb: VectorDb | undefined;

  constructor() {
    super();
    this.chatTransformer = undefined;
    this.vectorDb = undefined;
  }

  async initializeChatgptTutor(
    openaiApiKey: string,
    collectionName: string = 'course-collection'
  ): Promise<void> {
    this.initializeOpenaiAbstraction(openaiApiKey);
    const chromaAbstraction = new ChromaAbstraction();
    this.vectorDb = chromaAbstraction;
    await chromaAbstraction.initializeChromaAbstraction(
      openaiApiKey,
      collectionName
    );
    const metadata = this.vectorDb.courseCollection.metadata;
    if (metadata && metadata.generatedTransformerObjectString) {
      this.chatTransformer = generatedMessageTransformerParser(
        metadata.generatedTransformerObjectString
      ).parsedFunction;
    }
  }

  async generateResponse(
    messages: any[],
    aiAssistantId: string,
    positionInCourse: number[] | null = null,
    amountOfCourseContext: number | null = null,
    temperature: number = 1
  ): Promise<string> {
    if (!this.chatTransformer) {
      const messageTransformerObj = await this.generateMessageTransformer(
        messages
      );
      console.log(
        'This is your generated message transformer object:\n',
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
      temperature,
    });

    return completion.data.choices[0]?.message?.content;
  }

  async generateMessageTransformer(messages: any[]): Promise<string> {
    try {
      const stringifiedMessageInputInstance = JSON.stringify(messages[0]);
      const chatgptMessages = [
        {
          role: 'user',
          content: requestForMessageTransformer(
            stringifiedMessageInputInstance
          ),
        },
      ];

      const completion = await this.openaiClient.createChatCompletion({
        model: 'gpt-3.5-turbo-0613',
        messages: chatgptMessages,
        functions: [messageTransformerSignature],
        temperature: 0,
      });

      const parsedMessageTransformer = generatedMessageTransformerParser(
        completion.data.choices[0].message.function_call.arguments
      );

      await this.vectorDb?.courseCollection.modify({
        metadata: {
          ...this.vectorDb?.courseCollection.metadata,
          generatedTransformerObjectString:
            completion.data.choices[0].message.function_call.arguments,
        },
      });

      this.chatTransformer = parsedMessageTransformer.parsedFunction;

      return parsedMessageTransformer.parsedString;
    } catch (error) {
      return `Failed to generate message transformer with error:\n${error}`;
    }
  }
}
