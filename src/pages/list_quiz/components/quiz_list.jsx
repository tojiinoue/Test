import { useEffect, useRef } from "react";
import Simple_quiz from "./quiz_simple";

function Quiz_list(props) {
    // 画面に表示するクイズの個数を計算
    const add_num = useRef(Math.floor(window.innerHeight / 100) + 2);  

    // クイズのリストを取得して表示を管理
    const get_quiz_list = async (now) => {
        // フィルタリングの状態を数値に変換
        const filterStatus = props.filter === 'all' ? null : parseInt(props.filter, 10);

        let add_quiz_list = [];
        if (now - add_num.current < 0) {
            // クイズの総数を超えない場合
            add_quiz_list = await props.cont.get_quiz_list(0, now, filterStatus);
            props.now_numRef.current = 0;  // 次回の開始位置をリセット
        } else {
            // クイズの総数を超える場合
            add_quiz_list = await props.cont.get_quiz_list(now - add_num.current, now, filterStatus);
            props.now_numRef.current = now - add_num.current;  // 次回の開始位置を更新
        }

        // 重複クイズの削除
        const uniqueQuizzes = add_quiz_list.filter(
            (quiz) => !props.quiz_list.some((existingQuiz) => existingQuiz.quiz_id === quiz.quiz_id)
        );
        
        // クイズリストを更新
        //const now_quiz_list = add_quiz_list.map((quiz) => <Simple_quiz quiz={quiz} key={quiz.id} />);
        props.Set_quiz_list((prevList) => [...prevList, ...uniqueQuizzes]);
    };

    // クイズリストの取得が必要になった時に呼び出す
    useEffect(() => {
        // クイズリストをリセット
        props.Set_quiz_list([]);
        props.now_numRef.current = props.quiz_sum; // クイズの総数にリセット
        get_quiz_list(props.now_numRef.current);
    }, [props.filter]);  // フィルタリングの変更時にもリストを更新

    return null;  // このコンポーネント自体は何もレンダリングしない
}

export default Quiz_list;