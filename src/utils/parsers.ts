export const generatedMessageTransformerParser = (
  generatedString: string
): {
  parsedFunction: GeneratedTransformerFunction;
  parsedString: string;
} => {
  const markdownParsed = markdownToJsonParser(generatedString);
  const generatedObj: { transformer_function: string } =
    JSON.parse(markdownParsed);
  // eslint-disable-next-line no-eval
  const generatedTransformerFunction: GeneratedTransformerFunction = eval(
    markdownToJsonParser(generatedObj.transformer_function)
  );
  return {
    parsedFunction: generatedTransformerFunction,
    parsedString: generatedObj.transformer_function,
  };
};

export const positionInCourseParser = (positionInCourse: number[]): number => {
  // throw an error if positionInCourse.length > 5
  if (positionInCourse.length > 5) {
    throw new Error(
      'positionInCourseParser only supports positionInCourse arrays of length 5 or less'
    );
  }
  // add zeros to the array until it is length 5
  while (positionInCourse.length < 5) {
    positionInCourse.push(0);
  }
  // transform positionInCourse into into a list of strings
  const positionInCourseString = positionInCourse.map((position) =>
    position.toString().padStart(3, '0')
  );
  // combine the strings and parse the result into a number
  const positionInCourseNumber = parseInt(positionInCourseString.join(''), 10);

  return positionInCourseNumber;
};

export const markdownToJsonParser = (markdownString: string): string => {
  const splitMarkdownString = markdownString.split('```');
  if (splitMarkdownString.length > 2) {
    // checking if there's a closing fence too
    let codeBlock = splitMarkdownString[1];
    let indexOfFirstNewLine = codeBlock.indexOf('\n');
    if (indexOfFirstNewLine !== -1) {
      // Strip off the language tag that precedes the actual code
      codeBlock = codeBlock.substring(indexOfFirstNewLine + 1);
    }
    // Remove everything after the ending '```'
    codeBlock = codeBlock.split('```')[0];
    return codeBlock;
  }
  // If there is no code block, return the original string
  return markdownString;
};
