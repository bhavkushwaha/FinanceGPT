export const parseQuestions = (text: string | null) => {
  if (!text) {
    return [];
  }

  const pattern = /Question:\s*(.*?)\s*\s*A:\s*(.*?)\s*B:\s*(.*?)\s*C:\s*(.*?)\s*\s*D:\s*(.*?)\s*Correct Option:\s*(\w)/gm;

  const questionsList = [];
  let match = pattern.exec(text);

  while (match !== null) {
    const question = match[1].trim();
    const options = {
      A: match[2].trim(),
      B: match[3].trim(),
      C: match[4].trim(),
      D: match[5].trim(),
    };
    const correctAnswer = match[6].trim();

    const questionObject = {
      question,
      options,
      correct_answer: correctAnswer,
    };

    questionsList.push(questionObject);

    match = pattern.exec(text);
  }

  return questionsList;
}

// Example string to test
const str = `
Question: Which lifecycle method is called before a component is removed from the DOM?

    A: componentWillUnmount()

    B: componentDidMount()

    C: componentDidUpdate()

    D: shouldComponentUpdate()

Correct Option: A
`;

export const test = () => console.log(parseQuestions(str));