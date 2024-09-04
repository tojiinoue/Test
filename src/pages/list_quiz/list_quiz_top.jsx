// list_quiz_top.jsx

import { Contracts_MetaMask, QuizStatuses } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect, useRef, useCallback } from "react";
import Simple_quiz from "./components/quiz_simple";
import Quiz_list from "./components/quiz_list";

function List_quiz_top(props) {
    const cont = new Contracts_MetaMask();
    const targetRef = useRef(null);
    const now_numRef = useRef(0);
    const [quiz_sum, Set_quiz_sum] = useState(null);
    const [quiz_list, Set_quiz_list] = useState([]);
    const [add_num, Set_add_num] = useState(7);
    const [filter, setFilter] = useState('all');

    // クイズの総数を取得する
    useEffect(() => {
        cont.get_quiz_length().then((data) => {
            const now = parseInt(data);
            Set_quiz_sum(now);
            now_numRef.current = now;
        });
    }, []);

    // クイズリストをロードする関数を定義
    const loadMoreQuizzes = useCallback(async () => {
        const filterStatus = filter === 'all' ? null : parseInt(filter, 10); // フィルタリング条件を設定
        const end = now_numRef.current;
        const start = Math.max(0, end - add_num);

        // contracts.jsxのget_quiz_listメソッドを呼び出し
        const quizzes = await cont.get_quiz_list(start, end, filterStatus);
        Set_quiz_list((prevList) => [...prevList, ...quizzes]);

        now_numRef.current = start;
    }, [filter, add_num, cont]);

    // フィルタリング条件が変更された時にクイズリストを再取得
    useEffect(() => {
        loadMoreQuizzes();
    }, [filter, loadMoreQuizzes]);

    // フィルタリングオプションが変更された時の処理
    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    console.log("Target div is visible on the screen!");
                    loadMoreQuizzes();
                }
            });
        }, { threshold: 0.1 });

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [loadMoreQuizzes]);

    if (quiz_sum !== null) {
        return (
            <>
                {/* フィルタリング機能 */}
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