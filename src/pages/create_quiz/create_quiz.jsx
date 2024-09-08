import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import Answer_select from "./components/answer_select";
import Button from "react-bootstrap/Button";
import "react-datepicker/dist/react-datepicker.css";
import Wait_Modal from "../../contract/wait_Modal";

const { ethereum } = window;
const mkdStr = "";

// 未定義の関数を追加
function getLocalizedDateTimeString(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const formatter = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const localizedDateTimeString = formatter
        .format(now)
        .replace(/\u200E|\u200F/g, "")
        .replace(/\//g, "-")
        .replace(/ /, "T");

    return localizedDateTimeString;
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
        correct: ""
    }]);

    const [reply_startline, setReply_startline] = useState(
        new Date()
            .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
            .replace(/[/]/g, "-")
            .replace(/\s(\d):/, " 0$1:"),
    );
    const [reply_deadline, setReply_deadline] = useState(getLocalizedDateTimeString(addDays(new Date(), 1)));
    const [reward, setReward] = useState(0);
    let Contract = new Contracts_MetaMask();
    const [correct_limit, setCorrect_limit] = useState(null);
    const [show, setShow] = useState(false);

    const addQuizForm = () => {
        setQuizzes([...quizzes, { title: "", explanation: "", thumbnail_url: "", content: "", answer_type: 0, answer_data: [], correct: "" }]);
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

        // 一括でクイズを作成するロジック
        await Contract.create_bulk_quizzes(
            mainTitle, // 大枠のタイトルを追加
            quizzes.map(quiz => quiz.title),
            quizzes.map(quiz => quiz.explanation),
            quizzes.map(quiz => quiz.thumbnail_url),
            quizzes.map(quiz => quiz.content),
            quizzes.map(quiz => quiz.answer_type),
            quizzes.map(quiz => quiz.answer_data.toString()),
            quizzes.map(quiz => quiz.correct),
            reply_startline,
            reply_deadline,
            reward,
            correct_limit,
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
                        {/* 大枠のタイトル入力欄 */}
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

                            {/* 削除ボタン */}
                            <Button variant="danger" onClick={() => deleteQuizForm(index)}>削除</Button>
                        </div>
                    ))}

                    <Button variant="secondary" onClick={addQuizForm}>クイズを追加する</Button>

                    <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                        <Form.Label>回答開始日時</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={reply_startline}
                            onChange={(event) => setReply_startline(event.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                        <Form.Label>回答締切日時</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={reply_deadline}
                            onChange={(event) => setReply_deadline(event.target.value)}
                        />
                    </Form.Group>

                    <div style={{ textAlign: "right" }}>
                        <Button variant="primary" onClick={create_quizzes} style={{ marginTop: "20px" }}>
                            クイズを作成
                        </Button>
                    </div>
                </div>
                <div className="col-2" />
            </div>

            <Wait_Modal showFlag={show} />
        </div>
    );
}

export default Create_quiz;