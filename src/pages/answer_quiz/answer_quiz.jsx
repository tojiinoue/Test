import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import Button from "react-bootstrap/Button";
import Wait_Modal from "../../contract/wait_Modal";

function Show_correct(props){
    if(props.cont == true){
        return (
            <a>答えは{props.answer}</a>
        );
    } else {
        return <></>;
    }
}

function Answer_type1(props) {
    return (
        <>
            <a><br />選択式</a>
            <table className="table">
                <tbody>
                    {props.quiz.answer_data.split(",").map((cont) => {
                        let check_box = (
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={cont}
                                onChange={() => props.setAnswer(cont)}
                                checked={props.answer === cont}
                            />
                        );
                        return (
                            <tr key={cont}>
                                <th scope="col">{check_box}</th>
                                <th scope="col" className="left">{cont}</th>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}

function Answer_type2(props) {
    const [error_collect, SetError_Collect] = useState(true);

    const handle_Test_pattern = (event) => {
        const value = event.target.value;
        const pattern = new RegExp(props.quiz.answer_data.split(",")[0]);

        if (!pattern.test(value)) {
            SetError_Collect(true);
        } else {
            SetError_Collect(false);
        }

        props.setAnswer(value);
    };

    return (
        <>
            <a>入力形式</a>
            <div className="row">
                <div className="col-10">
                    <input
                        type="text"
                        className="form-control"
                        onChange={handle_Test_pattern}
                    />
                    {error_collect ? "エラー" : "OK"}
                </div>
            </div>
        </>
    );
}

function Answer_quiz() {
    const [quizSet, setQuizSet] = useState([]);
    const [answers, setAnswers] = useState({});
    const [show, setShow] = useState(false);
    const [is_correct_show, setIs_correct_show] = useState(false);

    const Contract = new Contracts_MetaMask();

    useEffect(() => {
        // クイズセットのデータを取得する
        const fetchQuizSet = async () => {
            const quizSetData = await Contract.get_quiz_set(); // クイズセットのデータを取得する関数
            setQuizSet(quizSetData);
        };

        fetchQuizSet();
    }, []);

    const handleAnswerChange = (quizId, answer) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [quizId]: answer
        }));
    };

    const submitAnswers = async () => {
        setShow(true);
        try {
            await Contract.bulkSubmitAnswers(answers);
            alert("解答を一括送信しました！");
        } catch (error) {
            alert("送信に失敗しました。");
        }
        setShow(false);
    };

    return (
        <>
            {quizSet.map(quiz => (
                <div key={quiz.id}>
                    <h2>{quiz.title}</h2>
                    <MDEditor.Markdown source={quiz.content} />
                    {quiz.answer_type === 0 ? (
                        <Answer_type1
                            quiz={quiz}
                            answer={answers[quiz.id]}
                            setAnswer={(answer) => handleAnswerChange(quiz.id, answer)}
                        />
                    ) : (
                        <Answer_type2
                            quiz={quiz}
                            answer={answers[quiz.id]}
                            setAnswer={(answer) => handleAnswerChange(quiz.id, answer)}
                        />
                    )}
                </div>
            ))}
            <Button onClick={submitAnswers}>解答を一括送信</Button>
            <Wait_Modal showFlag={show} />
        </>
    );
}

export default Answer_quiz;