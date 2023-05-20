export const generatedMessageTransformerParser = (
  generatedString: string
): GeneratedTransformerFunction => {
  const generatedObj: { javascriptFunction: string } =
    JSON.parse(generatedString);
  console.log('generatedObj', generatedObj);

  const generatedTransformerFunction: GeneratedTransformerFunction = eval(
    generatedObj.javascriptFunction
  );
  console.log('generatedTransformerFunction', generatedTransformerFunction);
  return generatedTransformerFunction;
};
