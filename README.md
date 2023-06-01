# chatgpttutor (aka chatipiti tutor)
### Install [npm package](https://www.npmjs.com/package/chatgpttutor)
`npm install chatgpttutor`



https://github.com/CakeCrusher/chatgpttutor/assets/37946988/8a800a40-19e5-4c43-b8f6-df2b7b9421a3

## Quickstart
Install the package
```shell
npm install chatgpttutor
```
Pipeline for generating response
```typescript
'use strict';
import { ChatgptTutor, ChromaAbstraction } from 'chatgpttutor';

const openaiApiKey = "OPENAI_API_KEY";
const pineconeApiKey = "ANYTHING" // currently unused

await chatgptTutor.initializeChatgptTutor(openaiApiKey, pineconeApiKey);

const messages = [
  {
    id: 'SuperGuy678',
    text: `
      Your task is to produce a greeting in the following JSON format:
      \`\`\`
      {
        "greeting": GREETING_STRING_HERE
      }
      \`\`\`
    `,
    sender_id: 'mainGyu',
    uid: '12345',
  },
];
// message transformation is currently inferred by ChatGPT
const res: string = await chatgptTutor.generateResponse(
  messages,
  messageTransformMockData.aiAssistantId
);
console.log(res);
// `{
//   "greeting": "Hello, world!"
// }`
```


## Development strategy
P̶T̶S̶D PDSD (Proompter Driven Software Development)
## Test passing probability = 40%
## TODO
- [ ] Create tests verifying that errors are handled gracefully
- [ ] Increase test passing probability
