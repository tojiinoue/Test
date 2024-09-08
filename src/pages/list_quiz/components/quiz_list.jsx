import { useEffect, useRef } from "react";
import Simple_quiz from "./quiz_simple";

function Quiz_list(props) {
    const { cont, quiz_list, Set_quiz_list, now_numRef, targetRef } = props;
    const add_num = useRef(Math.floor(window.innerHeight / 100) + 2); // 一度に追加するクイズ数

    // クイズのリストを取得する関数
    const get_quiz_list = async (now) => {
        let add_quiz_list = [];

        // クイズの総数を超えた場合の処理
        if (now - add_num.current < 0) {
            add_quiz_list = await cont.get_quiz_list(now, 0);
            now_numRef.current = 0;
        } else {
            add_quiz_list = await cont.get_quiz_list(now, now - add_num.current);
            now_numRef.current = now - add_num.current;
        }

        // 新たに取得したクイズをリストに追加
        Set_quiz_list((prevList) => [
            ...prevList, 
            ...add_quiz_list.map((quiz, index) => (
                <Simple_quiz key={index} quiz={quiz} />
            ))
        ]);
    };

    // IntersectionObserverを使用して無限スクロールを実装
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "-10px",
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    get_quiz_list(now_numRef.current);
                }
            });
        }, observerOptions);

        const targetElement = targetRef.current;
        if (targetElement) {
            observer.observe(targetElement);
        }

        return () => {
            if (targetElement) observer.unobserve(targetElement);
        };
    }, []);

    return null;
}

export default Quiz_list;