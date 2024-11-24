import axios from "axios";

export async function fetchNextQuestion(
  quesId: string,
  setData: (data: any) => void
) {
  try {
    const response = await axios.get("/api/question", {
      params: {
        questionId: quesId,
      },
    });
    const { questionId, question, options, answer } = response.data;
    setData({
      questionId,
      question,
      options,
      correct_answer: answer,
    });
  } catch (error: any) {
    console.log(error);
  }
}
