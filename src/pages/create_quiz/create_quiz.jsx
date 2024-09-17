import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import Answer_select from "./components/answer_select";
import Button from "react-bootstrap/Button";
import "react-datepicker/dist/react-datepicker.css";
import Wait_Modal from "../../contract/wait_Modal";

// 未定義の関数を追加
function getLocalizedDateTimeString(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}

function Create_quiz() {
    const [mainTitle, setMainTitle] = useState(""); // 大枠のタイトル
    const [quizzes, setQuizzes] = useState([{ // 初期状態として1つのクイズフォームを設定
        title: "",
        explanation: "",
        thumbnail_url: "",
        content: "",
        answer_type: 0,
        answer_data: [],
        correct: "",
        startline: getLocalizedDateTimeString(new Date()), // 個別の開始時間
        deadline: getLocalizedDateTimeString(addDays(new Date(), 1)), // 個別の終了時間
        reward: 0, // 個別の報酬
        respondent_limit: 0 // 個別の回答者制限
    }]);

    const [show, setShow] = useState(false);
    const Contract = new Contracts_MetaMask();
    const [correct_limit, setCorrect_limit] = useState(null);

    const addQuizForm = () => {
        setQuizzes([...quizzes, {
            title: "",
            explanation: "",
            thumbnail_url: "",
            content: "",
            answer_type: 0,
            answer_data: [],
            correct: "",
            startline: getLocalizedDateTimeString(new Date()), // 初期値を設定
            deadline: getLocalizedDateTimeString(addDays(new Date(), 1)),
            reward: 0,
            respondent_limit: 0
        }]);
    };

    const handleQuizChange = (index, field, value) => {
        const updatedQuizzes = quizzes.map((quiz, i) => i === index ? { ...quiz, [field]: value } : quiz);
        setQuizzes(updatedQuizzes);
    };

    const deleteQuizForm = (index) => {
        setQuizzes(quizzes.filter((_, i) => i !== index)); // 指定されたインデックスのクイズを削除
    };

    const create_quizzes = async () => {
        if (mainTitle.trim() === "") {
            alert("大枠のタイトルを入力してください");
            return;
        }
    
        const isValid = quizzes.every(quiz => quiz.correct !== "");
        if (!isValid) {
            alert("すべてのクイズに正解を入力してください");
            return;
        }
    
        // 各クイズのタイムスタンプや報酬を取得
        const quizDataArray = quizzes.map(quiz => ({
            title: quiz.title,
            explanation: quiz.explanation,
            thumbnail_url: quiz.thumbnail_url,
            content: quiz.content,
            answer_type: quiz.answer_type,
            answer_data: quiz.answer_data.toString(),
            answer: quiz.correct
        }));

        const startlines = quizzes.map(quiz => Math.floor(new Date(quiz.startline).getTime() / 1000));
        const deadlines = quizzes.map(quiz => Math.floor(new Date(quiz.deadline).getTime() / 1000));
        const rewards = quizzes.map(quiz => quiz.reward);
        const respondent_limits = quizzes.map(quiz => quiz.respondent_limit);

        // クイズ作成をコントラクトに送信
        await Contract.create_bulk_quizzes(
            mainTitle,
            quizDataArray,
            startlines,
            deadlines,
            rewards,
            respondent_limits,
            setShow
        );
    };

    useEffect(() => {
        async function get_contract() {
            setCorrect_limit((await Contract.get_num_of_students()) + 30);
        }
        get_contract();
    }, []);

    return (
        <div>
            <div className="row">
                <div className="col-2" />
                <div className="col-8">
                    <Form>
                        <Form.Group className="mb-3" controlId="main_title" style={{ textAlign: "left" }}>
                            <Form.Label>クイズセットの大枠タイトル</Form.Label>
                            <Form.Control type="text" placeholder="Enter Main Title" value={mainTitle} onChange={(e) => setMainTitle(e.target.value)} />
                        </Form.Group>
                    </Form>

                    {quizzes.map((quiz, index) => (
                        <div key={index}>
                            <Form>
                                <Form.Group className="mb-3" controlId={`form_title_${index}`} style={{ textAlign: "left" }}>
                                    <Form.Label>タイトル</Form.Label>
                                    <Form.Control type="text" placeholder="Enter Title" value={quiz.title} onChange={(e) => handleQuizChange(index, "title", e.target.value)} />
                                </Form.Group>
                            </Form>
                            <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                                <Form.Label>説明</Form.Label>
                                <Form.Control as="textarea" rows={quiz.explanation.split("\n").length + 3} value={quiz.explanation} onChange={(e) => handleQuizChange(index, "explanation", e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                                <Form.Label>サムネイル</Form.Label>
                                <Form.Control type="url" value={quiz.thumbnail_url} onChange={(e) => handleQuizChange(index, "thumbnail_url", e.target.value)} />
                            </Form.Group>
                            <img src={quiz.thumbnail_url} width="200" />
                            <br />

                            <Form.Group className="mb-3" data-color-mode="light" style={{ textAlign: "left" }}>
                                <Form.Label>内容</Form.Label>
                                <MDEditor height={500} value={quiz.content} onChange={(value) => handleQuizChange(index, "content", value)} />
                            </Form.Group>

                            <Answer_select name={"回答の追加"} variable={quiz.answer_data} variable1={quiz.correct} set={(data) => handleQuizChange(index, "answer_data", data)} set1={(data) => handleQuizChange(index, "correct", data)} setAnswer_type={(type) => handleQuizChange(index, "answer_type", type)} answer_type={quiz.answer_type} />

                            <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                                <Form.Label>回答開始日時</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={quiz.startline}
                                    onChange={(e) => handleQuizChange(index, "startline", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                                <Form.Label>回答締切日時</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={quiz.deadline}
                                    onChange={(e) => handleQuizChange(index, "deadline", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                                <Form.Label>報酬</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Reward"
                                    value={quiz.reward}
                                    onChange={(e) => handleQuizChange(index, "reward", Number(e.target.value))}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                                <Form.Label>回答者制限</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Respondent Limit"
                                    value={quiz.respondent_limit}
                                    onChange={(e) => handleQuizChange(index, "respondent_limit", Number(e.target.value))}
                                />
                            </Form.Group>

                            <Button variant="danger" onClick={() => deleteQuizForm(index)}>削除</Button>
                        </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                        <Button variant="secondary" onClick={addQuizForm}>クイズを追加する</Button>
                        <Button variant="primary" onClick={create_quizzes}>クイズを作成</Button>
                    </div>
                </div>
                <div className="col-2" />
            </div>

            <Wait_Modal showFlag={show} />
        </div>
    );
}

export default Create_quiz;