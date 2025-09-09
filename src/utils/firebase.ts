// FirebaseのSDKから必要な関数をインポート
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from 'firebase/analytics'; // Analyticsは任意

// あなたのFirebaseプロジェクトの設定
const firebaseConfig = {
  apiKey: "AIzaSyBGLjm2tNpLnILhi6lqAGtEDD4HMvY63Eo",
  authDomain: "self-analysis-fb103.firebaseapp.com",
  projectId: "self-analysis-fb103",
  storageBucket: "self-analysis-fb103.firebasestorage.app",
  messagingSenderId: "219585603426",
  appId: "1:219585603426:web:9dd8a3ac466d4e18fd2e3b",
  measurementId: "G-BL7382JDPH"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);
// Firestoreインスタンスを作成
export const db = getFirestore(app);
// export const analytics = getAnalytics(app); // Analyticsは必要なら有効化 