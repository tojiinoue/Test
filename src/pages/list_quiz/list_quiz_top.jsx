import { Contracts_MetaMask } from "../../contract/contracts";
import { useState, useEffect, useRef } from "react";
import Quiz_list from "./components/quiz_list";

function List_quiz_top() {
    // クイズのコントラクト
    const cont = new Contracts_MetaMask();

    // 現在表示している個数を保持するref
    const now_numRef = useRef(0); 
    const [quiz_sum, Set_quiz_sum] = useState(null); 
    const [quiz_list, Set_quiz_list] = useState([]);
    const [add_num, Set_add_num] = useState(7); // 一度に追加で表示するクイズの数
    const targetRef = useRef(null);

    // 初回レンダリング時にクイズの総数を取得
    useEffect(() => {
        cont.get_quiz_length().then((data) => {
            const total = parseInt(Number(data));
            Set_quiz_sum(total);
            now_numRef.current = total;
        });
    }, []);

    // クイズの合計が取得されている場合のみ表示
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
                <div ref={targetRef}>now_loading</div>
            </>
        );
    } else {
        return <></>;
    }
}

export default List_quiz_top;