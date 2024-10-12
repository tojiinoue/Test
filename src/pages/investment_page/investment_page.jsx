import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import { useLocation } from "react-router-dom";
import { Contracts_MetaMask } from "../../contract/contracts";

function Investment_to_quiz() {
  const location = useLocation();

  const [id, setId] = useState(location.state.args[0]);
  const [amount, setAmount] = useState(0);
  const [reduceAmount, setReduceAmount] = useState(0); // 減額する金額
  const [isNotPayingOut, setIsNotPayingOut] = useState("true");
  const [numOfStudent, setNumOfStudent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isteacher, setisteacher] = useState(null);
  const [isNotAddingReward, setIsNotAddingReward] = useState("true");
  const [students, setStudents] = useState(null);
  const [currentReward, setCurrentReward] = useState(0); // 現在の報酬

  let Contract = new Contracts_MetaMask();

  const handleOptionChange = (event) => {
    setIsNotPayingOut(event.target.value);
    console.log(isNotPayingOut);
  };

  const adding_reward = (event) => {
    setIsNotAddingReward(event.target.value);
    console.log(isNotAddingReward);
  };

  async function get_contract() {
    setNumOfStudent((await Contract.get_num_of_students()) + 30);
    const quizData = await Contract.get_quiz_simple(id);
    setCurrentReward(quizData[6]); // 報酬のインデックスに合わせて調整
  }

  async function is_teacher() {
    setisteacher(await Contract.isTeacher());
  }
  async function get_students() {
    setStudents(await Contract.get_student_list());
  }

  useEffect(() => {
    get_contract();
    is_teacher();
    get_students();
  }, []);

  const convertFullWidthNumbersToHalf = (() => {
    const diff = "０".charCodeAt(0) - "0".charCodeAt(0);
    return (text) =>
      text.replace(/[０-９]/g, (m) => String.fromCharCode(m.charCodeAt(0) - diff));
  })();

  const investment_to_quiz = async () => {
    if ((answer == "" && isNotPayingOut == "false") == false) {
      await Contract.investment_to_quiz(
        id,
        amount,
        convertFullWidthNumbersToHalf(answer),
        isNotPayingOut,
        numOfStudent,
        isNotAddingReward,
        students
      );
    } else {
      alert("答えを入力してください");
    }
  };

  // 新しい関数を追加：報酬を減額する
  const reduce_reward = async () => {
    if (reduceAmount <= 0) {
      alert("減額する金額は正の数である必要があります。");
      return;
    }
    if (reduceAmount > currentReward) {
      alert("減額する金額が現在の報酬を超えています。");
      return;
    }
    try {
      await Contract.reduce_reward(id, reduceAmount);
      alert("報酬を減額しました。ページを更新してください。");
      // 減額後の報酬を再取得
      const quizData = await Contract.get_quiz_simple(id);
      setCurrentReward(quizData[6]);
    } catch (err) {
      console.log(err);
      alert("エラーが発生しました。");
    }
  };

  console.log(isNotPayingOut);
  console.log(students);

  if (isteacher) {
    return (
      <div className="col mb-5">
        <div className="row justify-content-center">
          <div className="col-10">このテストのIDは{id}です</div>

          {/* 報酬の追加部分 */}
          <div className="col-10">
            <h5>報酬の追加</h5>
            <p>現在の報酬: {currentReward} FLT</p>
            以下に追加する報酬(FLT)の量を指定してください
            <br />
            <input
              type="text"
              className="form-control"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
              }}
            />
            正答した生徒一人ひとりに与えられるFLTトークン量： {amount} FLT
            <br />
            あなたから払いだされるFLTトークン量： {amount * numOfStudent} FLT
          </div>

          {/* 報酬の減額部分 */}
          <div className="col-10" style={{ marginTop: "20px" }}>
            <h5>報酬の減額</h5>
            <p>現在の報酬: {currentReward} FLT</p>
            以下に減額する報酬(FLT)の量を指定してください
            <br />
            <input
              type="number"
              className="form-control"
              value={reduceAmount}
              onChange={(event) => {
                setReduceAmount(Number(event.target.value));
              }}
            />
            減額後の報酬: {currentReward - reduceAmount} FLT
            <br />
            <Button
              variant="warning"
              onClick={() => reduce_reward()}
              style={{ marginTop: "10px" }}
            >
              報酬を減額する
            </Button>
          </div>

          {/* 答えの入力とオプション */}
          <div className="col-10" style={{ marginTop: "20px" }}>
            以下に確定した答えを入力してください
            <input
              type="text"
              className="form-control"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
              }}
            />
          </div>
          <br />
          以下は、解答を確定して報酬の払い出しを行うか行わないかの選択です。
          <div className="col-10">
            <label>
              <input
                type="radio"
                value="true"
                onChange={handleOptionChange}
                checked={isNotPayingOut === "true"}
              />
              まだ報酬の払い出しを行わない
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="false"
                onChange={handleOptionChange}
                checked={isNotPayingOut === "false"}
              />
              解答を確定して報酬を払い出す
            </label>
          </div>
          <br />
          この問題は発表されましたか？発表されていれば発表者に二倍のトークンを支払います
          <div className="col-10">
            <label>
              <input
                type="radio"
                value="true"
                onChange={adding_reward}
                checked={isNotAddingReward === "true"}
              />
              発表されていない
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="false"
                onChange={adding_reward}
                checked={isNotAddingReward === "false"}
              />
              発表されている
            </label>
          </div>

          {/* ボタン */}
          <Button
            className="col-10"
            variant="primary"
            onClick={() => investment_to_quiz()}
            style={{ marginTop: "20px" }}
          >
            報酬の追加、報酬の払い出しを実行
          </Button>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}

export default Investment_to_quiz;