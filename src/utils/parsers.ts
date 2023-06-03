export const generatedMessageTransformerParser = (
  generatedString: string
): GeneratedTransformerFunction => {
  generatedString = markdownToJsonParser(generatedString);
  const generatedObj: { javascriptFunction: string } =
    JSON.parse(generatedString);

  const generatedTransformerFunction: GeneratedTransformerFunction = eval(
    generatedObj.javascriptFunction
  );
  return generatedTransformerFunction;
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
  if (splitMarkdownString.length > 1) {
    // if splitMarkdownString[1] starts with the string "json" delete it
    let startWithBrackets =
      '{' + splitMarkdownString[1].split('{').slice(1).join('{');
    return startWithBrackets;
  }
  return splitMarkdownString[0];
};
