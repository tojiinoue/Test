import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import Answer_select from "./components/answer_select";
import Button from "react-bootstrap/Button";
import "react-datepicker/dist/react-datepicker.css";
import Wait_Modal from "../../contract/wait_Modal";
import connectToContract from '../../contract/interact'; // interact.js をインポート

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
    const [mainTitle, setMainTitle] = useState(""); 
    const [quizzes, setQuizzes] = useState([{ 
        title: "",
        explanation: "",
        thumbnail_url: "",
        content: "",
        answer_type: 0,
        answer_data: [],
        correct: "",
        startline: getLocalizedDateTimeString(new Date()), 
        deadline: getLocalizedDateTimeString(addDays(new Date(), 1)), 
        reward: 0, 
        respondent_limit: 0 
    }]);

    const [show, setShow] = useState(false);
    const Contract = new Contracts_MetaMask();
    const [correct_limit, setCorrect_limit] = useState(null);
    const [contractInstance, setContractInstance] = useState(null);

    const addQuizForm = () => {
        setQuizzes([...quizzes, {
            title: "",
            explanation: "",
            thumbnail_url: "",
            content: "",
            answer_type: 0,
            answer_data: [],
            correct: "",
            startline: getLocalizedDateTimeString(new Date()), 
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
        setQuizzes(quizzes.filter((_, i) => i !== index));
    };

    // Quiz作成処理
    const create_quizzes = async () => {
        if (!contractInstance) {
            alert("MetaMaskと接続できていません。再度接続してください。");
            return;
        }

        if (mainTitle.trim() === "") {
            alert("大枠のタイトルを入力してください");
            return;
        }

        const isValid = quizzes.every(quiz => quiz.correct !== "");
        if (!isValid) {
            alert("すべてのクイズに正解を入力してください");
            return;
        }

        const titles = quizzes.map(quiz => quiz.title);
        const quizDataArray = quizzes.map(quiz => ({
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

        try {
            await contractInstance.create_bulk_quizzes(
                mainTitle,
                titles, 
                quizDataArray,
                startlines,
                deadlines,
                rewards,
                respondent_limits
            );
            alert("クイズが正常に作成されました。");
        } catch (error) {
            console.error("クイズ作成中にエラーが発生しました:", error);
            alert("クイズ作成中にエラーが発生しました。詳細はコンソールをご確認ください。");
        }
    };

    useEffect(() => {
        async function initializeContract() {
            const instance = await connectToContract();
            setContractInstance(instance);
        }

        initializeContract();

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
                            {/* クイズのフィールドを入力するUI */}
                            <Form.Group className="mb-3" controlId={`form_title_${index}`} style={{ textAlign: "left" }}>
                                <Form.Label>タイトル</Form.Label>
                                <Form.Control type="text" placeholder="Enter Title" value={quiz.title} onChange={(e) => handleQuizChange(index, "title", e.target.value)} />
                            </Form.Group>
                            {/* ...その他のクイズフィールド */}
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