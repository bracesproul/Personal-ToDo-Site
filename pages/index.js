import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'

import { initializeApp } from "firebase/app";
import { getAnalytics, setUserId } from "firebase/analytics";
import { doc, setDoc, getFirestore, collection, query, getDocs, deleteDoc } from "firebase/firestore"; 
import { GoogleAuthProvider, signInWithRedirect, getAuth, onAuthStateChanged, signOut } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCT1A-nxNjwYuGFSLqoB0sfilLcfzFq9T0",
  authDomain: "personal-70519.firebaseapp.com",
  projectId: "personal-70519",
  storageBucket: "personal-70519.appspot.com",
  messagingSenderId: "763443484581",
  appId: "1:763443484581:web:1d7909830b3d8d90db7a4c",
  measurementId: "G-DPSH8XKXTB"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const provider = new GoogleAuthProvider();
const auth = getAuth();


onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    console.log(uid)
    console.log(auth.currentUser.uid)
  } else {
    console.log('not logged in')
    signInWithRedirect(auth, provider);
    //console.log(auth.currentUser.uid)
  }
});




//const analytics = getAnalytics(app);

export default function Home() {
  return (
    <div>
      <SignOut />
      <All />
    </div> 
  )
}

const All = () => {

  const [user, setUser] = useState('')

  useEffect(() => {
    if (auth.currentUser === null) return;
    if (auth.currentUser.uid === null) {
      setUser('guest')
    } else {
      setUser(auth.currentUser.uid)
    }
  }, [])

  console.log(user)

  const AddToDo = () => {

    const [todo, setTodo] = useState('')
    const [toDoTitle, setToDoTitle] = useState('')
    const [render, setRender] = useState(0)
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      const toDoId = nanoid();
      await setDoc(doc(db, 'todo', toDoId), {
        title: toDoTitle,
        toDo: todo,
        id: toDoId
      })
      location.reload()
    }
  
    const handleTextChange = (e) => {
      e.preventDefault()
      const value = e.target.value;
      setTodo(value)
      console.log(todo)
    }
  
    const handleTitleChange = (e) => {
      e.preventDefault()
      const value = e.target.value;
      setToDoTitle(value)
      console.log(toDoTitle)
    }
  
    return (
      <div>
        <h1>Add todo</h1>
        <form method="POST" id="addToDo">
          <label htmlFor="addToDo">Add To Do</label> <br />
          <input placeholder='Title' type="text" name="title" onChange={e => handleTitleChange(e)} /> <br />
          <textarea placeholder='ToDo' name="addToDo" onChange={e => handleTextChange(e)} /> <br />
          <button onClick={e => handleSubmit(e)}>Add</button>
        </ form>
      </div>
    )
  }
  
  const DisplayToDo = () => {
  
    const [readTodo, setReadTodo] = useState([{}])
    const [renderTodo, setRenderTodo] = useState();
    const [render, setRender] = useState(0)
  
    useEffect(() => {
      async function getToDo() {
        const q = query(collection(db, 'todo'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setReadTodo((prev) => [...prev, doc.data()])
        });
      }
      getToDo();
    }, [])  
  
    const toDoV = readTodo.map((todo, index) => {
      const id = todo.id;
      return (
        <div key={index}>
          <h1>Title: {todo.title}</h1>
          <h3>Body: {todo.toDo}</h3>
          <button onClick={(e) => handleComplete(e, id)}>Remove</button>
          <hr />
        </div>
      )
    })
  
    const handleComplete = async (e, id) => {
      const toDoId = id;
      console.log(toDoId)
      await deleteDoc(doc(db, 'todo', toDoId))
      console.log('doc deleted')
      setRender(prev => prev + 1)
      return false;
    }
     
    return (
      <div>
        <h1>Todo</h1>
        {toDoV}
      </div>
    )
  }


  return (
    <>
      {!user === 'nYWOJWcGbEfHCg3J6bG8fyPhqjl1' ? <h1>Guest</h1> : 
      <>
        <AddToDo />
        <DisplayToDo />
      </>
      }

    </>
  )
}

const SignOut = () => {

  const signout = (e) => {
    signOut(auth).then(() => {
      console.log('Sign-out successful.');
    }).catch((error) => {
      console.log('error:', error);
    });
  }

  return (
    <button onClick={e => signout(e)}>Sign Out</button>
  )
}


