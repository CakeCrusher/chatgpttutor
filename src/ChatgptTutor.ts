import {
  generateMessageTransformerPrompt,
  messageWithContent,
} from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/parsers';
import { OpenaiAbstraction } from './OpenaiAbstraction';
import { ChromaAbstraction } from './ChromaAbstraction';

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
    const stringifiedMessageInputInstance = JSON.stringify(messages[0]);
    const prompt = generateMessageTransformerPrompt(
      stringifiedMessageInputInstance
    );

    // first attempt at generating message transformer
    let generatedString = await this.basicChatgptRequest(prompt, 0);
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
        'Failed to generate first transformer function with generatedString:',
        generatedString,
        'and error:',
        error
      );
      let fixedGeneratedString;
      try {
        let truncatedError = error.toString().substring(0, 200);
        if (error.message) {
          truncatedError = error.message.substring(0, 200);
        }
        fixedGeneratedString = await this.chatgptErrorResolver(
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
        console.error(
          'Failed to generate message transformer function with fixedGeneratedString:',
          fixedGeneratedString,
          'and error:',
          error
        );
        throw new Error(
          'Failed to generate message transformer function. Please create your own function that transforms a single message to be of type `ChatgptMessage`, then assign it to the property `chatTransformer`.'
        );
      }
    }

    return generatedString;
  }
}
