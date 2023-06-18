# chatgpttutor (aka chatipiti tutor)

https://github.com/CakeCrusher/chatgpttutor/assets/37946988/19c08777-e321-4ad4-8ab4-3c47acc3ed0c


## Quickstart
0. Make sure to have chroma server running on port 8000 (default port). See [chroma](https://github.com/chroma-core/chroma)

1. Install [npm package](https://www.npmjs.com/package/chatgpttutor)
```bash
npm install chatgpttutor
```
2. Example usage
```js
'use strict'
import dotenv from 'dotenv';
import {ChatgptTutor} from 'chatgpttutor'
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const collectionName = "demoCollection"

const chatgpttutor = new ChatgptTutor()


await chatgpttutor.initializeChatgptTutor(OPENAI_API_KEY, collectionName) // Initialize chatgpttutor and the chroma vector database collection (if not already exists)

// delete this
await chatgpttutor.vectorDb.chromaClient.reset()
await chatgpttutor.initializeChatgptTutor(OPENAI_API_KEY, collectionName)

const randomStructureConversation = [
  {
    id: 'Assistant1',
    text: 'In one sentence tell me what context length means in nlp',
    sender_id: 'Student1',
    uid: '1',
  },
  {
    id: 'Student1',
    text: 'In NLP, context length refers to the number of preceding words or tokens that an AI language model considers when generating its response.',
    sender_id: 'Assistant1',
    uid: '2',
  },
  {
    id: 'Assistant1',
    text: 'what is the context length of gpt-3.5-turbo.',
    sender_id: 'Student1',
    uid: '3',
  },
]; // mock conversation of random schema!
const aiAssistantId = "Assistant1"

const preContentFirstResponse = await chatgpttutor.generateResponse(
  randomStructureConversation, // Conversation to be passed into ChatGTP. 
  aiAssistantId, // Id of the AI assistant. This is used to distinguish the AI assistant from the student.
  [3, 2, 0], // Student's current position in course. This is used to determine which content to return from the database.
  3, // Amount of context to be passed into the query
  0 // temperature of the response. 0 (most deterministic) - 1 (most stochastic)
); // Uses ChatGPT function calling to generate a transformer to transform you data to the format chatgpttutor expects!

console.log("Pre content first response:\n", preContentFirstResponse)
// Pre content first response:
//   There is no such model as "gpt-3.5-turbo," but in general, the context length of a
//   language model like GPT-3 refers to the number 
//   of preceding words or tokens it considers when generating its response.

const firstLesson = {
  contentInSequence: [
    `We released gpt-3.5-turbo and gpt-4 earlier this year, and in only a short few months, have seen incredible applications built by developers on top of these models.

    Today, we're following up with some exciting updates:

    new function calling capability in the Chat Completions API
    updated and more steerable versions of gpt-4 and gpt-3.5-turbo
    new 16k context version of gpt-3.5-turbo (vs the standard 4k version)
    75% cost reduction on our state-of-the-art embeddings model
    25% cost reduction on input tokens for gpt-3.5-turbo
    announcing the deprecation timeline for the gpt-3.5-turbo-0301 and gpt-4-0314 models`,
    `All of these models come with the same data privacy and security guarantees we introduced on March 1 — customers own all outputs generated from their requests and their API data will not be used for training.`
  ], 
  positionInCourse: [3, 1, 5], 
  batchSize: 20
}
await chatgpttutor.vectorDb.addCourseSegment(
  firstLesson.contentInSequence, // List of context you want to be added to the course. Can be of length 1 - n
  firstLesson.positionInCourse, // Position in the course you want the content to be added. Maximum array length of 4. Number can be 0 - 999. In this case the positions in course created will be [3, 1, 5, n]
  firstLesson.batchSize // Size of the items stored in database. (these will be returned as context and will use up API tokens)
) // adds course content in the desired sequence

const firstResponse = await chatgpttutor.generateResponse(
  randomStructureConversation,
  aiAssistantId,
  [3, 2, 0],
  3,
  0
);

console.log("First response:\n", firstResponse)
// First response:
//   The context length of the new 16k version of GPT-3.5-turbo is longer than
//   the standard 4k version, and there are also updated and 
//   more steerable versions of GPT-4 and GPT-3.5-turbo available.

const secondLesson = {
  contentInSequence: [
    `Developers can now describe functions to gpt-4-0613 and gpt-3.5-turbo-0613, and have the model intelligently choose to output a JSON object containing arguments to call those functions. This is a new way to more reliably connect GPT's capabilities with external tools and APIs.

    These models have been fine-tuned to both detect when a function needs to be called (depending on the user's input) and to respond with JSON that adheres to the function signature. Function calling allows developers to more reliably get structured data back from the model. For example, developers can:`
  ],
  positionInCourse: [3, 2, 3],
  batchSize: 20
} 
await chatgpttutor.vectorDb.addCourseSegment(
  secondLesson.contentInSequence,
  secondLesson.positionInCourse,
  secondLesson.batchSize
)

// continue the randomStructureConversation with 2 more messages
const continuedRandomStructureConversation = [
  ...randomStructureConversation,
  {
    id: 'Student1',
    text: firstResponse,
    sender_id: 'Assistant1',
    uid: '4',
  },
  {
    id: 'Assistant1',
    text: 'What do I describe my gpt function to?',
    sender_id: 'Student1',
    uid: '5',
  },
]

const tooEarlyInLessonSecondResponse = await chatgpttutor.generateResponse(
  continuedRandomStructureConversation,
  aiAssistantId,
  [3, 2, 0],
  3,
  0
);
console.log("Too early in lesson second response:\n", tooEarlyInLessonSecondResponse)
// Too early in lesson second response:
//   To describe your GPT function, you may want to consider the context length of the
//   model you are using, such as the new 16k version of GPT-3.5-turbo or the updated
//   and more steerable versions of GPT-4 and GPT-3.5-turbo, and be aware of
//   the deprecation timeline for older models like gpt-3.5-turbo-0301 and gpt-4-0314.

const secondResponse = await chatgpttutor.generateResponse(
  continuedRandomStructureConversation,
  aiAssistantId,
  [3, 2, 7],
  3,
  0
);
console.log("Second response:\n", secondResponse)
// Second response:
//   You can now describe your GPT function to both GPT-4-0613 and
//   GPT-3.5-turbo-0613, which will intelligently output a JSON object to call
//   those functions, providing a more reliable way to connect GPT's capabilities
//   with external tools and APIs.
```

## Development strategy
P̶T̶S̶D PDSD (Proompter Driven Software Development)

# Contributors welcome!
Feel free to contribute to this project! I'm open to any suggestions and improvements. If you have any questions, comments, or anything else, feel free to reach out to me!
