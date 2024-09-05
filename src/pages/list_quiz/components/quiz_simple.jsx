import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./quiz_simple.css";

// クイズの残り時間を計算する関数
function Time_diff(props) {
    function convertSecondsToHours(secondsLimit, secondsStart) {
        let isBeforeStartline = false;

        const date1 = new Date(); // 現在時刻
        const date2 = new Date(secondsLimit * 1000); // 終了時間
        const date3 = new Date(secondsStart * 1000); // 開始時間

        const epochTime1 = Math.floor(date1.getTime() / 1000); // 現在時刻をエポック時間に変換
        const epochTime2 = Math.floor(date2.getTime() / 1000); // 終了時間をエポック時間に変換
        const epochTime3 = Math.floor(date3.getTime() / 1000); // 開始時間をエポック時間に変換

        let elapsedTime = 0;

        if (epochTime1 < epochTime3) {
            elapsedTime = Math.floor(Math.abs(epochTime3 - epochTime1));
            elapsedTime = new Date(elapsedTime * 1000);
            isBeforeStartline = true;
        } else {
            elapsedTime = Math.floor(Math.abs(epochTime2 - epochTime1));
            elapsedTime = new Date(elapsedTime * 1000);
        }

        const labels = ["年", "ヶ月", "日", "時間", "分", "秒"];
        let date = [];
        date.push(elapsedTime.getUTCFullYear() - 1970);
        date.push(elapsedTime.getUTCMonth());
        date.push(elapsedTime.getUTCDate() - 1);
        date.push(elapsedTime.getUTCHours());
        date.push(elapsedTime.getUTCMinutes());
        date.push(elapsedTime.getUTCSeconds());
        let res = "";

        for (let i = 0; i < date.length; i++) {
            if (date[i] !== 0) {
                res += date[i].toString() + labels[i];
            }
        }

        if (isBeforeStartline) {
            return "回答開始時間まで" + res;
        } else {
            return epochTime2 - epochTime1 > 0 ? "締め切りまで " + res : "締切終了";
        }
    }

    return <div>{convertSecondsToHours(parseInt(props.limit), parseInt(props.start))}</div>;
}

function Simple_quiz(props) {
    const [show, setShow] = useState(false);
    const [isReward, setIsReward] = useState(true);
    const [isPayment, setIsPayment] = useState(false);

    useEffect(() => {
        if (Number(props.quiz[7]) === 0) {
            setIsReward(false);
        }
        if (props.quiz[11]) {
            setIsPayment(true);
            setIsReward(false);
        }
    }, [props.quiz]);

    const cardStatusClass = Number(props.quiz[10]) === 0 ? "bg-blue" : "";

    // クイズの状態を表示する部分を修正
    const quizStatus =
        Number(props.quiz[10]) === 0
            ? "未回答"
            : Number(props.quiz[10]) === 1
            ? "不正解"
            : Number(props.quiz[10]) === 2
            ? "正解"
            : Number(props.quiz[10]) === 3
            ? "回答済み"
            : "";

    return (
        <>
            <div onClick={() => setShow(true)}>
                <div className={`quiz_card ${cardStatusClass} ${isPayment ? "border border-danger" : ""} ${isReward ? "border border-primary" : ""}`}>
                    <Link
                        to={{
                            pathname: "/answer_quiz/" + Number(props.quiz[0]),
                            state: { back_page: 0 },
                        }}
                        style={{ color: "black", textDecoration: "none" }}
                    >
                        <div className="row quiz_card_1">
                            <div className="col-2">
                                <img src={props.quiz[4]} className="img-fluid" alt="Quiz Thumbnail" />
                            </div>
                            <div className="col-10" style={{ textAlign: "left" }}>
                                <div className="row h-20">
                                    <div className="col-sm-12 col-md-12 col-lg-12 ">{props.quiz[2]}</div>
                                </div>
                                <div className="row h-80" style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1" }}>
                                    <div className="col-sm-12 col-md-12 col-lg-12 ">{props.quiz[3]}</div>
                                </div>
                                <div className="row h-20" style={{ fontSize: "14px" }}>
                                    <Time_diff start={Number(props.quiz[5])} limit={Number(props.quiz[6])} />
                                </div>
                                <div className="d-flex" style={{ fontSize: "14px", lineHeight: "1" }}>
                                    <div className="col-3">
                                        <div className="col">報酬</div>
                                        <div className="col" style={{ textAlign: "center" }}>
                                            {Number(props.quiz[7]) / 10 ** 18} FLT
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="col">回答者数</div>
                                        <div className="col" style={{ textAlign: "center" }}>
                                            {Number(props.quiz[8])}
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="col">上限</div>
                                        <div className="col" style={{ textAlign: "center" }}>
                                            {Number(props.quiz[9])}
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="col">状態</div>
                                        <div className="col" style={{ textAlign: "center" }}>
                                            {quizStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Simple_quiz;