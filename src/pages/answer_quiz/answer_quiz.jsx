import { useState, useEffect } from "react";
import { Contracts_MetaMask } from "../../contract/contracts";
import Button from "react-bootstrap/Button";
import Wait_Modal from "../../contract/wait_Modal";
import Answer_type1 from "./components/Answer_type1";
import Answer_type2 from "./components/Answer_type2";

function Answer_quiz() {
    const [quizzes, setQuizzes] = useState([]);
    const [answers, setAnswers] = useState({});
    const [show, setShow] = useState(false);
    const [content, setContent] = useState("");
    const ids = useParams()["id"].split(","); // クイズセットのIDを取得

    useEffect(() => {
        async function fetchQuizzes() {
            const Contract = new Contracts_MetaMask();
            const quizzesInSet = await Promise.all(ids.map(id => Contract.get_quiz(id)));
            setQuizzes(quizzesInSet);
        }
        fetchQuizzes();
    }, [ids]);

    const handleAnswerChange = (quizId, answer) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [quizId]: answer,
        }));
    };

    const submitAllAnswers = async () => {
        setShow(true);
        const Contract = new Contracts_MetaMask();
        await Contract.bulkSubmitAnswers(Object.entries(answers).map(([quizId, answer]) => ({ quizId, answer, user: Contract.getUserAddress() })));
        setShow(false);
        alert("一括で解答を送信しました！");
    };

    return (
        <div>
            <h1>クイズセット詳細</h1>
            {quizzes.map((quiz, index) => (
                <div key={index}>
                    <h2>{quiz.title}</h2>
                    <p>{quiz.explanation}</p>
                    {Number(quiz.answer_type) === 0 && <Answer_type1 quiz={quiz} answer={answers[quiz.id]} setAnswer={(answer) => handleAnswerChange(quiz.id, answer)} />}
                    {Number(quiz.answer_type) === 1 && <Answer_type2 quiz={quiz} answer={answers[quiz.id]} setAnswer={(answer) => handleAnswerChange(quiz.id, answer)} />}
                </div>
            ))}
            <Button variant="primary" onClick={submitAllAnswers}>解答を一括送信</Button>
            <Wait_Modal showFlag={show} content={content} />
        </div>
    );
}

export default Answer_quiz;