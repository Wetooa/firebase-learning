import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FormEvent, useEffect, useRef } from "react";
import { firebaseConfig } from "./config";

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth as any);

  return (
    <div className="App">
      <header>
        THIS IS A STUPID MESSENGER CLONE
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function ChatRoom() {
  const messageRef = firestore.collection("messages");

  const query = messageRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query as any, { idField: "id" } as any);

  const messageContainer: React.MutableRefObject<any> = useRef();
  const scrollRef: React.MutableRefObject<any> = useRef();

  const sendMessage = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser!;

    await messageRef.add({
      text: messageContainer.current.value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    messageContainer.current.value = "";
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    messageContainer.current && messageContainer.current.focus();
  }, []);

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => {
            return <ChatMessage key={index} {...msg} />;
          })}

        <div ref={scrollRef}></div>
      </main>
      <form>
        <input ref={messageContainer} type="text" id="message" />
        <button type="submit" onClick={sendMessage}>
          Submit
        </button>
      </form>
    </>
  );
}

function ChatMessage(message: any) {
  const { text, uid, photoURL } = message;
  console.log(photoURL);
  console.log(message);

  const messageClass = uid === auth.currentUser?.uid ? "sent" : "recieved";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} alt={text} />
        <p>{text}</p>
      </div>
    </>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

export default App;
