import { useState, useEffect, useRef } from "react";
import { Contracts_MetaMask } from "../../contract/contracts"; // コントラクトのインスタンスをインポート
import { Link } from "react-router-dom";

function List_quiz_top(props) {
    const [quizSets, setQuizSets] = useState([]); // クイズセットのリストを管理
    const containerRef = useRef(null);

    useEffect(() => {
        async function fetchQuizSets() {
            const Contract = new Contracts_MetaMask();
            const sets = await Contract.getAllQuizSets(); // すべてのクイズセットを取得するコントラクト関数を呼び出し
            setQuizSets(sets);
        }
        fetchQuizSets();
    }, []);

    return (
        <div ref={containerRef}>
            <h1>クイズセット一覧</h1>
            {quizSets.map((set, index) => (
                <div key={index} className="quiz-set-item">
                    <h2>{set.mainTitle}</h2>
                    <p>クイズ数: {set.quizIds.length}</p>
                    <Link to={`/answer_quiz/${set.quizIds.join(",")}`}>解答する</Link>
                </div>
            ))}
        </div>
    );
}

export default List_quiz_top;