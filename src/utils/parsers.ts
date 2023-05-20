export const generatedMessageTransformerParser = (
  generatedString: string
): GeneratedTransformerFunction => {
  const generatedObj: { javascriptFunction: string } =
    JSON.parse(generatedString);

  const generatedTransformerFunction: GeneratedTransformerFunction = eval(
    generatedObj.javascriptFunction
  );
  return generatedTransformerFunction;
};
