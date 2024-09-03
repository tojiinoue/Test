import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect, useRef } from "react";
import Simple_quiz from "./components/quiz_simple";
import Quiz_list from "./components/quiz_list";
import { Link } from "react-router-dom";

function List_quiz_top(props) {
    // クイズのコントラクト
    const cont = new Contracts_MetaMask();

    const targetRef = useRef(null);  // スクロール監視のためのターゲット
    const now_numRef = useRef(0);    // 現在表示しているクイズの個数を保持
    const [quiz_sum, Set_quiz_sum] = useState(null);  // クイズの総数
    const [quiz_list, Set_quiz_list] = useState([]);  // 表示するクイズのリスト
    const [add_num, Set_add_num] = useState(7);       // 1回の更新で追加で表示するクイズの個数
    const [filter, setFilter] = useState('all');      // フィルタリングの状態

    // クイズの総数を取得する
    useEffect(() => {
        cont.get_quiz_length().then((data) => {
            const now = parseInt(data);
            Set_quiz_sum(now);
            now_numRef.current = now;  // 表示クイズ数を更新
        });
    }, []);

    // フィルタリング条件が変更された時にクイズリストを再取得
    useEffect(() => {
        loadMoreQuizzes();
    }, [filter]);

    // フィルタリングオプションが変更された時の処理
    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // クイズリストの取得および表示を管理
    const loadMoreQuizzes = async () => {
        const filterStatus = filter === 'all' ? null : parseInt(filter, 10);
        const end = now_numRef.current;
        const start = Math.max(0, end - add_num);  // 追加するクイズの開始位置を計算

        // クイズを取得してリストに追加
        const quizzes = await cont.get_quiz_list(start, end, filterStatus);
        Set_quiz_list((prevList) => [...prevList, ...quizzes]);

        now_numRef.current = start;  // 取得済みのクイズの個数を更新
    };

    // IntersectionObserverでターゲットがビューポートに入った時にクイズを追加で読み込む
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    console.log("Target div is visible on the screen!");
                    loadMoreQuizzes();  // クイズをさらに取得
                }
            });
        }, { threshold: 1.0 });

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, []);

    if (quiz_sum !== null) {
        return (
            <>
                {/* 絞り込み機能 */}
                <Form.Select value={filter} onChange={handleFilterChange}>
                    <option value="all">全て</option>
                    <option value="0">未回答</option>
                    <option value="1">不正解</option>
                    <option value="2">正解</option>
                </Form.Select>

                {/* スクロールを監視するコンポーネント */}
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
                    filter={filter}
                />

                {/* クイズリストの表示 */}
                {quiz_list.map((quiz, index) => (
                    <Simple_quiz key={index} quiz={quiz} />
                ))}
                <div ref={targetRef}>now_loading</div>
            </>
        );
    } else {
        return <></>;
    }
}

export default List_quiz_top;