import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import MDEditor, { selectWord } from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Wait_Modal from "../../contract/wait_Modal";

function Show_correct(props){
    if(props.cont == true){
        return (
            <a>答えは{props.answer}</a>
        );
    }else{
        return <></>;
    }
}

function Answer_type1(props) {
    return (
        <>
            <a>
                <br />
                選択式
            </a>
            <table className="table">
                <tbody>
                    {props.quiz[6].split(",").map((cont) => {
                        let check_box;
                        if (props.answer == cont) {
                            check_box = (
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={cont}
                                    id="flexCheckChecked"
                                    onChange={() => {
                                        props.setAnswer(cont);
                                    }}
                                    checked
                                />
                            );
                        } else {
                            check_box = (
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={cont}
                                    id="flexCheckChecked"
                                    onChange={() => {
                                        props.setAnswer(cont);
                                    }}
                                />
                            );
                        }
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
    const answer_data = props.quiz[6].split(",");
    const pattern = answer_data[0];
    const example = answer_data[1];
    const [error_collect, SetError_Collect] = useState(true);
    useEffect(() => {
        console.log(props.quiz);
        console.log(pattern);
        console.log(example);
    }, []);

    const handle_Test_pattern = (event, target_set) => {
        const value = event.target.value;

        if (!new RegExp(pattern).test(value)) {
            target_set(true);
            console.log("errr");
        } else {
            target_set(false);
        }
    };

    return (
        <>
            <a>入力形式</a>
            <div className="row">
                <div className="col-10">
                    正解を入力
                    <br />
                    <p>例:{example}</p>
                    <input
                        type="text"
                        className="form-control"
                        value={props.answer}
                        onChange={(event) => {
                            handle_Test_pattern(event, SetError_Collect);
                            props.setAnswer(event.target.value);
                        }}
                    />
                    {error_collect ? "エラー" : "OK"}
                </div>
            </div>
        </>
    );
}

function Answer_quiz() {
    const [answer, setAnswer] = useState();
    const [now, setnow] = useState(null);
    const [show, setShow] = useState(false);
    const [content, setContent] = useState("");
    const [is_correct_show, setIs_correct_show] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [simple_quiz, setSimple_quiz] = useState(null);
    const [answers, setAnswers] = useState([]); // 一括解答用の解答データ

    let Contract = new Contracts_MetaMask();
    const id = useParams()["id"];

    const get_quiz = async () => {
        setQuiz(await Contract.get_quiz(id));
        setSimple_quiz(await Contract.get_quiz_simple(id));
    };

    const convertFullWidthNumbersToHalf = (() => {
        const diff = "０".charCodeAt(0) - "0".charCodeAt(0);
        return text => text.replace(/[０-９]/g, m => String.fromCharCode(m.charCodeAt(0) - diff));
    })();

    const addAnswer = () => {
        // 現在の解答を追加
        if (answer) {
            const newAnswer = {
                id,
                answer: convertFullWidthNumbersToHalf(answer)
            };
            setAnswers([...answers, newAnswer]); // 解答をリストに追加
            resetFields(); // フィールドをリセット
        } else {
            alert("解答を入力してください");
        }
    };

    const create_answers = async () => {
        if (answers.length > 0) {
            setShow(true);
            try {
                await Contract.save_answers(answers); // 一括解答用のコントラクト呼び出し
                alert("クイズの解答を一括で送信しました");
                setAnswers([]); // 解答リストをクリア
            } catch (error) {
                alert("解答の送信に失敗しました");
            }
            setShow(false);
        } else {
            alert("少なくとも1つの解答を追加してください");
        }
    };

    const resetFields = () => {
        setAnswer("");
    };

    const create_answer = async () => {
        if (quiz[15] == true){
            setIs_correct_show(true);
            return;
        }
        if (parseInt(quiz[8]).toString() <= now) {
            const res = Contract.create_answer(id, convertFullWidthNumbersToHalf(answer), setShow, setContent);
        } else {
            alert("まだ回答開始時間になっていません");
        }
    };

    useEffect(() => {
        get_quiz();
        setnow(Math.floor(new Date().getTime() / 1000));
    }, []);

    if (quiz && simple_quiz) {
        return (
            <>
                <h3 style={{ margin: "50px" }}>
                    {Number(simple_quiz["state"]) == 0 ? "初回の回答です。正解するとトークンがもらえます" : 
                     Number(simple_quiz["state"]) == 1 ? "初回の回答で間違えています。正解してもトークンはもらえません" : 
                     Number(simple_quiz["state"]) == 2 ? "正解しています" : ""}
                </h3>
                <div className="container" style={{ "text-align": "left", "margin-bottom": "50px" }}>
                    <h2>{quiz[2]}</h2>
                    <br />
                    <a style={{ "white-space": "pre-wrap", "font-size": "14px", "line-height": "1" }}>
                        <br />
                        {quiz[3]}
                    </a>
                    <br />
                    <br />
                    <a>出題者:{quiz[1]}</a>
                    <br />
                    <br />

                    <div data-color-mode="light" className="left" style={{ "text-align": "left" }}>
                        <MDEditor.Markdown source={quiz[5]} />
                    </div>

                    {Number(quiz[13]) == 0 && <Answer_type1 quiz={quiz} answer={answer} setAnswer={setAnswer} />}
                    {Number(quiz[13]) == 1 && <Answer_type2 quiz={quiz} answer={answer} setAnswer={setAnswer} />}

                    <div class="d-flex justify-content-end">
                        <Button variant="secondary" onClick={addAnswer}>
                            解答を追加
                        </Button>
                        <Button variant="primary" onClick={create_answers}>
                            解答を一括送信
                        </Button>
                    </div>
                    <Show_correct cont={is_correct_show} answer={quiz[14]}/>
                </div>
                <Wait_Modal showFlag={show} content={content} />
            </>
        );
    } else {
        return <></>;
    }
}

export default Answer_quiz;