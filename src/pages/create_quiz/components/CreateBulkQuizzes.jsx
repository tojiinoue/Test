import React, { useState } from "react";
import { Contracts_MetaMask } from "../../contract/contracts"; // MetaMaskとスマートコントラクトとの接続

function CreateBulkQuizzes() {
  const [quizzes, setQuizzes] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0, reward: 0 },
  ]);

  // クイズを追加するためのハンドラ
  const addQuiz = () => {
    setQuizzes([
      ...quizzes,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, reward: 0 },
    ]);
  };

  // クイズを削除するためのハンドラ
  const removeQuiz = (index) => {
    const newQuizzes = quizzes.filter((_, i) => i !== index);
    setQuizzes(newQuizzes);
  };

  // クイズデータの更新
  const updateQuiz = (index, field, value) => {
    const newQuizzes = [...quizzes];
    newQuizzes[index][field] = value;
    setQuizzes(newQuizzes);
  };

  // クイズの選択肢データの更新
  const updateOption = (quizIndex, optionIndex, value) => {
    const newQuizzes = [...quizzes];
    newQuizzes[quizIndex].options[optionIndex] = value;
    setQuizzes(newQuizzes);
  };

  // 一括投稿の送信
  const handleBulkSubmit = async () => {
    try {
      const questions = quizzes.map((quiz) => quiz.question);
      const options = quizzes.map((quiz) => quiz.options);
      const correctAnswers = quizzes.map((quiz) => quiz.correctAnswer);
      const rewards = quizzes.map((quiz) => quiz.reward);

      // スマートコントラクトの関数呼び出し
      await Contracts_MetaMask.postBulkQuizzes(questions, options, correctAnswers, rewards);
      alert("Quizzes posted successfully!");
    } catch (error) {
      console.error("Error posting quizzes:", error);
      alert("Failed to post quizzes.");
    }
  };

  return (
    <div>
      <h1>Create Bulk Quizzes</h1>
      {quizzes.map((quiz, index) => (
        <div key={index}>
          <h3>Quiz {index + 1}</h3>
          <input
            type="text"
            placeholder="Question"
            value={quiz.question}
            onChange={(e) => updateQuiz(index, "question", e.target.value)}
          />
          {quiz.options.map((option, optIndex) => (
            <input
              key={optIndex}
              type="text"
              placeholder={`Option ${optIndex + 1}`}
              value={option}
              onChange={(e) => updateOption(index, optIndex, e.target.value)}
            />
          ))}
          <input
            type="number"
            placeholder="Correct Answer (0-3)"
            value={quiz.correctAnswer}
            onChange={(e) => updateQuiz(index, "correctAnswer", Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Reward"
            value={quiz.reward}
            onChange={(e) => updateQuiz(index, "reward", Number(e.target.value))}
          />
          <button onClick={() => removeQuiz(index)}>Remove Quiz</button>
        </div>
      ))}
      <button onClick={addQuiz}>Add Another Quiz</button>
      <button onClick={handleBulkSubmit}>Submit All Quizzes</button>
    </div>
  );
}

export default CreateBulkQuizzes;