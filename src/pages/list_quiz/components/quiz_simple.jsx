import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./quiz_simple.css";

function Simple_quiz({ quiz }) {
    const [show, setShow] = useState(false);
    const [isReward, setIsReward] = useState(true);
    const [isPayment, setIsPayment] = useState(false);

    useEffect(() => {
        setIsReward(Number(quiz[7]) !== 0);
        setIsPayment(quiz[11]);
    }, [quiz]);

    const quizStatus = ["未回答", "不正解", "正解", "回答済み"][quiz[10]] || "";
    const cardStatusClass = Number(quiz[10]) === 0 ? 'bg-blue' : '';

    return (
        <div onClick={() => setShow(true)}>
            <div className={`quiz_card ${cardStatusClass} ${isPayment ? 'border border-danger' : ''} ${isReward ? 'border border-primary' : ''}`}>
                <Link to={`/answer_quiz/${Number(quiz[0])}`} style={{ color: "black", textDecoration: "none" }}>
                    <div className="row quiz_card_1">
                        <div className="col-2">
                            <img src={quiz[4]} className="img-fluid" alt="Quiz Thumbnail" />
                        </div>
                        <div className="col-10" style={{ textAlign: "left" }}>
                            <div className="row h-20">
                                <div className="col-sm-12 col-md-12 col-lg-12">{quiz[2]}</div>
                            </div>
                            <div className="row h-80" style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1" }}>
                                <div className="col-sm-12 col-md-12 col-lg-12">{quiz[3]}</div>
                            </div>
                            <div className="row h-20" style={{ fontSize: "14px" }}>
                                <Time_diff start={Number(quiz[5])} limit={Number(quiz[6])} />
                            </div>
                            <div className="d-flex" style={{ fontSize: "14px", lineHeight: "1" }}>
                                <div className="col-3">報酬 {Number(quiz[7]) / (10 ** 18)} FLT</div>
                                <div className="col-3">回答者数 {Number(quiz[8])}</div>
                                <div className="col-3">上限 {Number(quiz[9])}</div>
                                <div className="col-3">状態 {quizStatus}</div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Simple_quiz;