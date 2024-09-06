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

function Create_quiz() {
    const [useing_address, Set_useing_address] = useState(null);
    const [title, setTitle] = useState("");
    const [explanation, setExplanation] = useState("");
    const [thumbnail_url, setThumbnail_url] = useState("");
    const [content, setContent] = useState("");
    const [answer_type, setAnswer_type] = useState(0);
    const [answer_data, setAnswer_data] = useState([]);
    const [correct, setCorrect] = useState("");
    const [reply_startline, setReply_startline] = useState(
        new Date()
            .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
            .replace(/[/]/g, "-")
            .replace(/\s(\d):/, " 0$1:")
    );
    const [reply_deadline, setReply_deadline] = useState(getLocalizedDateTimeString(addDays(new Date(), 1)));
    const [reward, setReward] = useState(0);

    let Contract = new Contracts_MetaMask();

    const [correct_limit, setCorrect_limit] = useState(null);
    const [state, setState] = useState("Null");
    const [now, setnow] = useState(null);
    const [show, setShow] = useState(false);

    const [quizzes, setQuizzes] = useState([]); // 一括投稿用のクイズデータ

    const convertFullWidthNumbersToHalf = (() => {
        // 全角数字と半角数字の差分を計算
        const diff = "０".charCodeAt(0) - "0".charCodeAt(0);

        // 置換関数を返す
        return text =>
            text.replace(/[０-９]/g, m => String.fromCharCode(m.charCodeAt(0) - diff));
    })();

    const addQuiz = () => {
        // 現在のクイズ情報を追加
        if (correct !== "") {
            const newQuiz = {
                title,
                explanation,
                thumbnail_url,
                content,
                answer_type,
                answer_data,
                correct: convertFullWidthNumbersToHalf(correct),
                reply_startline,
                reply_deadline,
                reward,
                correct_limit
            };
            setQuizzes([...quizzes, newQuiz]); // クイズをリストに追加
            resetFields(); // フィールドをリセット
        } else {
            alert("正解を入力してください");
        }
    };

    const create_quizzes = async () => {
        if (quizzes.length > 0) {
            setShow(true);
            try {
                await Contract.create_quizzes(quizzes); // 一括投稿用のコントラクト呼び出し
                alert("クイズを一括で作成しました");
                setQuizzes([]); // クイズリストをクリア
            } catch (error) {
                alert("クイズ作成に失敗しました");
            }
            setShow(false);
        } else {
            alert("少なくとも1つのクイズを追加してください");
        }
    };

    const resetFields = () => {
        setTitle("");
        setExplanation("");
        setThumbnail_url("");
        setContent("");
        setAnswer_type(0);
        setAnswer_data([]);
        setCorrect("");
        setReply_startline(
            new Date()
                .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
                .replace(/[/]/g, "-")
                .replace(/\s(\d):/, " 0$1:")
        );
        setReply_deadline(getLocalizedDateTimeString(addDays(new Date(), 1)));
        setReward(0);
    };

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

    // 初回のみ実行
    useEffect(() => {
        async function get_contract() {
            setCorrect_limit((await Contract.get_num_of_students()) + 30);
        }
        get_contract();
        setnow(getLocalizedDateTimeString());
    }, []);

    return (
        <div>
            <div className="row">
                <div className="col-2" />
                <div className="col-8">
                    <Form>
                        <Form.Group className="mb-3" controlId="form_titile" style={{ textAlign: "left" }}>
                            <Form.Label>タイトル</Form.Label>
                            <Form.Control type="text" placeholder="Enter Title" value={title} onChange={(event) => setTitle(event.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                            <Form.Label>説明</Form.Label>
                            <Form.Control as="textarea" rows={explanation.split("\n").length + 3} value={explanation} onChange={(event) => setExplanation(event.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                            <Form.Label>サムネイル</Form.Label>
                            <Form.Control type="url" value={thumbnail_url} onChange={(event) => setThumbnail_url(event.target.value)} />
                        </Form.Group>
                        <img src={thumbnail_url} width="200" />
                        <br />
                        <Form.Group className="mb-3" data-color-mode="light" style={{ textAlign: "left" }}>
                            <Form.Label>内容</Form.Label>
                            <MDEditor height={500} value={content} onChange={setContent} />
                        </Form.Group>
                        <Answer_select name={"回答の追加"} variable={answer_data} variable1={correct} set={setAnswer_data} set1={setCorrect} setAnswer_type={setAnswer_type} answer_type={answer_type} />
                        <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                            <Form.Label>回答開始日時</Form.Label>
                            <Form.Control type="datetime-local" defaultValue={now} min={now} onChange={(event) => setReply_startline(new Date(event.target.value))} />
                        </Form.Group>
                        <Form.Group className="mb-3" style={{ textAlign: "left" }}>
                            <Form.Label>回答締切日時</Form.Label>
                            <Form.Control type="datetime-local" defaultValue={reply_deadline} min={now} onChange={(event) => setReply_deadline(new Date(event.target.value))} />
                        </Form.Group>

                        <div style={{ textAlign: "right" }}>
                            <Button variant="secondary" onClick={addQuiz} style={{ marginTop: "20px", marginRight: "10px" }}>
                                クイズを追加
                            </Button>
                            <Button variant="primary" onClick={create_quizzes} style={{ marginTop: "20px" }}>
                                クイズを一括作成
                            </Button>
                        </div>

                        {/* クイズリスト表示 */}
                        {quizzes.length > 0 && (
                            <div>
                                <h4>追加されたクイズ</h4>
                                <ul>
                                    {quizzes.map((quiz, index) => (
                                        <li key={index}>{quiz.title}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Wait_Modal showFlag={show} />
                    </Form>
                </div>
                <div className="col-2" />
            </div>
        </div>
    );
}

export default Create_quiz;