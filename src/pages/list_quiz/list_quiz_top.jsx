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
    const [loading, setLoading] = useState(false);  // ローディング状態を管理
    const [error, setError] = useState(null);       // エラーメッセージを管理

    // クイズの総数を取得する
    useEffect(() => {
        const fetchQuizLength = async () => {
            try {
                console.log("Fetching quiz length...");
                const data = await cont.get_quiz_length();
                const now = parseInt(data);
                console.log("Quiz length obtained:", now);
                Set_quiz_sum(now);
                now_numRef.current = now;
            } catch (err) {
                console.error("Error fetching quiz length:", err);
                setError("クイズの総数を取得できませんでした。");
            }
        };
    
        fetchQuizLength();
    }, [cont]);

    // クイズリストをロードする関数を定義
    const loadMoreQuizzes = useCallback(async () => {
        if (loading || quiz_sum === null) return;  // ローディング中またはクイズの総数が未取得の場合は処理を中断
        setLoading(true);     // ローディング状態を設定

        try {
            const filterStatus = filter === 'all' ? null : parseInt(filter, 10); // フィルタリング条件を設定
            const end = now_numRef.current;
            const start = Math.max(0, end - add_num);

            // contracts.jsxのget_quiz_listメソッドを呼び出し
            const quizzes = await cont.get_quiz_list(start, end, filterStatus);

            // クイズデータの重複を削除
            Set_quiz_list((prevList) => {
                const newQuizzes = quizzes.filter(
                    (quiz) => !prevList.some((prevQuiz) => prevQuiz.quiz_id === quiz.quiz_id)
                );
                return [...prevList, ...newQuizzes];
            });

            now_numRef.current = start;
        } catch (err) {
            console.error("Error loading quizzes:", err);
            setError("クイズのリストを取得できませんでした。");
        } finally {
            setLoading(false);  // ローディング状態を解除
        }
    }, [filter, add_num, cont, loading, quiz_sum]);

    // クイズリストをリセットする関数を追加
    const resetQuizList = useCallback(() => {
        Set_quiz_list([]); // クイズリストを空にリセット
        now_numRef.current = quiz_sum; // クイズの総数にリセット
    }, [quiz_sum]);

    // フィルタリング条件が変更された時にクイズリストをリセットして再取得
    useEffect(() => {
        resetQuizList();  // リストをリセット
        loadMoreQuizzes(); // 新しいフィルタリング条件でクイズを取得
    }, [filter, loadMoreQuizzes, resetQuizList]);

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

    if (error) {
        return <div>{error}</div>;  // エラーメッセージを表示
    }

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
                {loading && <div>読み込み中...</div>}
                <div ref={targetRef}>now_loading</div>
            </>
        );
    } else {
        return <></>;
    }
}

export default List_quiz_top;