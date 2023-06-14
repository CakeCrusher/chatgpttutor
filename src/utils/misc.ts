export const batchString = (
  str: string,
  overlap: number,
  batchSize: number
): string[] => {
  const strWordsArray = str.split(' ');
  const batchedStrings: string[] = [];
  let left = 0;
  let leftOverlap = overlap;
  let right = 1;
  let rightOverlap = overlap;
  while (left < strWordsArray.length) {
    while (right - left < batchSize - 1) {
      if (!strWordsArray[left - 1] && !strWordsArray[right + 1]) {
        break;
      }
      if (leftOverlap && strWordsArray[left - 1]) {
        leftOverlap -= 1;
        left -= 1;
      } else if (rightOverlap && strWordsArray[right + 1]) {
        rightOverlap -= 1;
        right += 1;
      } else if (strWordsArray[right + 1]) {
        right += 1;
      } else {
        left -= 1;
      }
    }
    batchedStrings.push(strWordsArray.slice(left, right + 1).join(' '));
    left = right + 1;
    leftOverlap = overlap;
    right = left + 1;
    rightOverlap = overlap;
  }

  return batchedStrings;
};

export const functionRepeater = async (
  func: Function,
  times: number
): Promise<any> => {
  let result;
  for (let i = 0; i < times; i++) {
    result = await func();
    if (result) {
      return result;
    }
  }
  return result;
};
