import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import Link from 'next/link'
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
  } else {
    //console.log('not logged in')
    signInWithRedirect(auth, provider);
    //console.log(auth.currentUser.uid)
  }
});

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

  const AddToDo = () => {

    const [todo, setTodo] = useState('')
    const [toDoTitle, setToDoTitle] = useState('')
    const [loggedIn, setLoggedIn] = useState(false)
    const [link, setLink] = useState('')

    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          if ( uid === "nYWOJWcGbEfHCg3J6bG8fyPhqjl1" ) {
            setLoggedIn(true)
          }
        } else {
          //user logged out
        }
      });
    }, [])
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      const toDoId = nanoid();
      await setDoc(doc(db, 'todo', toDoId), {
        title: toDoTitle,
        toDo: todo,
        link: link,
        id: toDoId
      })
      location.reload()
    }
  
    const handleTextChange = (e) => {
      e.preventDefault()
      const value = e.target.value;
      setTodo(value)
      //console.log(todo)
    }
  
    const handleTitleChange = (e) => {
      e.preventDefault()
      const value = e.target.value;
      setToDoTitle(value)
      //console.log(toDoTitle)
    }

    const handleLinkChange = e => {
      e.preventDefault()
      const value = e.target.value;
      setLink(value)
      //console.log(toDoTitle)
    }
  
    return (
      <div>
        { loggedIn ? (
          <>
          <h1>Add todo</h1>
          <form method="POST" id="addToDo">
            <label htmlFor="addToDo">Add To Do</label> <br />
            <input placeholder='Title' type="text" name="title" onChange={e => handleTitleChange(e)} /> <br />
            <textarea placeholder='ToDo' name="addToDo" onChange={e => handleTextChange(e)} /> <br />
            <input type="text" name="link" placeholder='Link' onChange={e => handleLinkChange(e)} /> <br />
            <button onClick={e => handleSubmit(e)}>Add</button>
          </ form>
          </>
        ) : <h1>You are not admin</h1> }
      </div>
    )
  }
  
  const DisplayToDo = () => {
  
    const [readTodo, setReadTodo] = useState([])
    const [loggedIn, setLoggedIn] = useState(false)
  
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
    
    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          if ( uid === "nYWOJWcGbEfHCg3J6bG8fyPhqjl1" ) {
            setLoggedIn(true)
          }
        } else {
          //user logged out
        }
      });
    }, [])
  
    const toDoV = readTodo.map((todo, index) => {
      const id = todo.id;
      let linkFromDB = todo.link;
      if (linkFromDB == undefined) {
        linkFromDB = '';
      }
      return (
        <div className={styles.flexContainer} key={index}>
          <h3>Title: {todo.title}</h3>
          <h4>Body:</h4>
          <p>{todo.toDo}</p>
          <p style={stylesForLink}><Link href={linkFromDB} >{linkFromDB}</Link></p>
          <button onClick={(e) => handleComplete(e, id)}>Remove</button>
        </div>
      )
    })
  
    const handleComplete = async (e, id) => {
      const toDoId = id;
      await deleteDoc(doc(db, 'todo', toDoId))
      return false;
    }
     
    return (
      <div>
        { loggedIn ? toDoV : null }
      </div>
    )
  }

  const DisplayList = () => {
    const dateV = new Date();
    const date = `${dateV.toLocaleDateString()} ${dateV.toLocaleTimeString()}`
    console.log(date)

    const [list, setList] = useState('')
    const [listFromDB, setListFromDB] = useState([])

    useEffect(() => {
      async function getList() {
        const q = query(collection(db, 'list'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          console.log(doc.id, '=>', doc.data())
          setListFromDB((prev) => [...prev, doc.data()])
        });
      }
      getList();
    }, [])

    const handleListChange = (e) => {
      const value = e.target.value;
      setList(value)
      console.log(list)
    }

    const handleListSubmit = async (e) => {
      e.preventDefault();
      const listId = nanoid();
      const forDB = {
        list: list,
        id: listId,
        date: date
      }
      await setDoc(doc(db, 'list', listId), forDB)
      console.log(forDB)
      location.reload()
    }

    const handleDelete = async (e, id) => {
      e.preventDefault();
      const listId = id;
      await deleteDoc(doc(db, 'list', listId));
      location.reload()
    }

    const writeList = listFromDB.map((list, index) => {
      return (
        <div className={styles.eachList} key={index}>
          <p className={styles.listDate}>{list.date}</p>
          <p className={styles.listText}>{list.list}</p>
          <button onClick={e => handleDelete(e, list.id)}>Delete</button>
        </div>
      )
    })

    return (
      <div className={styles.listContainer}>
        <h1>List</h1>
        <input type="text" placeholder='Add list item' name="list" onChange={(e => handleListChange(e))} />
        <button onClick={e => handleListSubmit(e)} >Add</button>
        <div>
          {writeList}
        </div>
      </div>
    )
  }

  return (
    <>
      <AddToDo />
      <div className={styles.flexAll}>
        <DisplayToDo />
        <DisplayList />
      </div>
    </>
  )
}

const SignOut = () => {

  const signout = (e) => {
    signOut(auth).then(() => {
      //console.log('Sign-out successful.');
    }).catch((error) => {
      //console.log('error:', error);
    });
  }

  return (
    <button onClick={e => signout(e)}>Sign Out</button>
  )
}

const stylesForLink = {
  "color": "blue"
}