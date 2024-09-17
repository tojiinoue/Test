import { ethers } from 'ethers';
import quizABI from './quiz_abi.json'; // 更新したスマートコントラクトのABIをインポート
import { quiz_address } from './config'; // スマートコントラクトのアドレスをインポート

// ウォレットに接続してプロバイダを作成
const connectToContract = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' }); // ウォレットの接続を要求
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(); // サインナーを取得（署名をするためのユーザーのアカウント）
            
            // スマートコントラクトのインスタンスを作成
            const contract = new ethers.Contract(quiz_address, quizABI.abi, signer);
            console.log('スマートコントラクトに接続しました:', contract);
            return contract;
        } catch (error) {
            console.error('コントラクトの接続に失敗しました:', error);
        }
    } else {
        alert('MetaMaskがインストールされていません！');
    }
};

export default connectToContract;