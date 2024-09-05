import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect, useRef } from "react";
import Simple_quiz from "./components/quiz_simple";
import Quiz_list from "./components/quiz_list";

function List_quiz_top(props) {
    // クイズのコントラクト
    let cont = new Contracts_MetaMask();

    // 現在表示している個数を保持するref
    const now_numRef = useRef(0); // 保存
    // クイズの総数
    const [quiz_sum, Set_quiz_sum] = useState(null); // 保存

    // 表示するクイズのリスト
    const [quiz_list, Set_quiz_list] = useState([]); // 保存
    // 1回の更新で追加で表示する個数
    const [add_num, Set_add_num] = useState(7);
    // コンテナのrefを作成
    const containerRef = useRef(null);
    const targetRef = useRef(null); // ターゲット要素のrefを作成

    // クイズの状態を管理するステートを追加
    const [selectedStatus, setSelectedStatus] = useState(0);

    const handleStatusChange = (event) => {
        setSelectedStatus(Number(event.target.value)); // ドロップダウンで選択した値を設定
        Set_quiz_list([]); // クイズリストをリセット
        now_numRef.current = 0; // 現在の表示数をリセット
    };

    useEffect(() => {
        // クイズ数を取得し、リセット
        cont.get_quiz_length().then((data) => {
            let now = parseInt(Number(data));
            Set_quiz_sum(now);
            now_numRef.current = now;
        });
    }, [selectedStatus]); // selectedStatus の変更時にもリストを再取得

    return (
        <>
            {/* ドロップダウンメニュー */}
            <Form.Select
                aria-label="クイズの状態を選択"
                onChange={handleStatusChange}
                value={selectedStatus}
                style={{ marginBottom: "20px" }}
            >
                <option value={0}>全て</option>
                <option value={1}>未回答</option>
                <option value={2}>不正解</option>
                <option value={3}>正解</option>
                <option value={4}>回答済み</option>
            </Form.Select>

            {/* クイズリスト表示部分 */}
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
                selectedStatus={selectedStatus} // 選択されたクイズの状態を渡す
            />

            {quiz_list.map((quiz, index) => (
                <div key={index}>{quiz}</div> 
            ))}

            <div ref={targetRef}>
                {/* ターゲット要素の内容 */}
                now_loading
            </div>
        </>
    );
}

export default List_quiz_top;