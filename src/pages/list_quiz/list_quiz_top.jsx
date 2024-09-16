import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect, useRef } from "react";
import MDEditor, { selectWord } from "@uiw/react-md-editor";
import { resolvePath, useParams } from "react-router-dom";
import Simple_quiz from "./components/quiz_simple";
import Quiz_list from "./components/quiz_list";
import { Link } from "react-router-dom";

function List_quiz_top(props) {
    //クイズのコントラクト
    let cont = new Contracts_MetaMask();

    //現在表示している個数を保持するref
    const now_numRef = useRef(0); //保存
    //クイズの総数
    const [quiz_sum, Set_quiz_sum] = useState(null); //保存

    //表示するクイズのリスト
    const [quiz_list, Set_quiz_list] = useState([]); //保存
    //１回の更新で追加で表示する個数
    const [add_num, Set_add_num] = useState(7);
    // コンテナのrefを作成
    const containerRef = useRef(null);

    const targetRef = useRef(null); // ターゲット要素のrefを作成

    useEffect(() => {
        // クイズの総数を取得
        cont.get_quiz_length().then((data) => {
            let now = parseInt(Number(data));
            Set_quiz_sum(now);
            now_numRef.current = now;
        });
    }, []);

    const fetchQuizzes = async (now) => {
        let add_quiz_list = [];
        // クイズの総数を超えていない場合はクイズを取得
        if (now > 0) {
            for (let i = now; i > Math.max(now - add_num, 0); i--) {
                const quiz = await cont.get_quiz_simple(i - 1);
                add_quiz_list.push(quiz);
            }
            now_numRef.current = Math.max(now - add_num, 0);
        }

        // クイズをコンポーネントに追加
        let now_quiz_list = add_quiz_list.map((quiz, index) => (
            <Simple_quiz key={index} quiz={quiz} />
        ));

        Set_quiz_list((prevQuizList) => [...prevQuizList, ...now_quiz_list]);
    };

    useEffect(() => {
        if (quiz_sum != null) {
            fetchQuizzes(now_numRef.current);
        }
    }, [quiz_sum]);

    if (quiz_sum != null) {
        return (
            <>
                <Quiz_list
                    cont={cont}
                    add_num={add_num}
                    Set_add_num={Set_add_num}
                    quiz_sum={quiz_sum}
                    Set_quiz_sum={Set_quiz_sum}
                    quiz_list={quiz_list}
                    Set_quiz_list={Set_quiz_list}
                    targetRef={targetRef}
                    now_numRef={now_numRef}
                />
                {quiz_list.map((quiz, index) => (
                    <div key={index}>{quiz}</div>
                ))}
                <div ref={targetRef}>
                    now_loading
                </div>
            </>
        );
    } else {
        return <></>;
    }
}
export default List_quiz_top;