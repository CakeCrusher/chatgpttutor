import { ChatgptRoleEnum } from '../../types/enums';

export const messageTransformer = (
  message: string,
  isUser: boolean
): ChatgptMessage => {
  return {
    role: isUser ? ChatgptRoleEnum.USER : ChatgptRoleEnum.ASSISTANT,
    content: message,
  };
};
