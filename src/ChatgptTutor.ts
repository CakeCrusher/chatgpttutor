import {
  generateMessageTransformerPrompt,
  messageWithContent,
} from './utils/prompts';
import { generatedMessageTransformerParser } from './utils/parsers';
import { OpenaiAbstraction } from './OpenaiAbstraction';
import { ChromaAbstraction } from './ChromaAbstraction';
import { messageTransformer } from './utils/chatgptFunctionsSignature';

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
    const functionSignature =     {
      "name": "message_transformer",
      "description": `Parses a stringified javascript function to transform a message of unknown schema into an object of type ChatgptMessage delimited by triple backticks.
      \`\`\`
      type ChatgptRole = 'user' | 'assistant' | 'system';
      type ChatgptMessage = {
        role: ChatgptRole;
        content: string;
      };
      \`\`\``,
      "parameters": {
        "type": "object",
        "properties": {
          "transformer_function": {
            "type": "string",
            "description": `The stringified javascript single line arrow function that is passed two inputs: 'message' (object representing a message instance of an unknown schema) and 'aiAssistantId' (string representing the id that will determine if the role of the user who wrote the message is "assistant" or "user").
            The function will return an object of type ChatgptMessage delimited by triple backticks.
            \`\`\`
            type ChatgptRole = 'user' | 'assistant' | 'system';
            type ChatgptMessage = {
              role: ChatgptRole;
              content: string;
            };
            \`\`\``,
          },
        },
        "required": ["transformer_function"]
      },
      function_call: {"name": "message_transformer"},
    }
    const chatgptMessages = [
      {"role": "user", "content": `Please create a function to transform the message example delimited by triple backticks into a message of ChatgptMessage schema.
      \`\`\`
      ${stringifiedMessageInputInstance}
      \`\`\``},
    ]

    const completion = await this.openaiClient.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: chatgptMessages,
      functions: [functionSignature],
      temperature: 0,
    });
    
    const jsonResponse = JSON.parse(completion.data.choices[0].message.function_call.arguments);
    
    this.chatTransformer = eval(jsonResponse.transformer_function);

    return jsonResponse.transformer_function
  }
}
