export enum ChatgptRoleEnum {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export const ChatgptMessageTypeInString = `{
  role: ChatgptRole;
  content: string;
}`;