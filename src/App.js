/**
 * Import Statments
 */

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import "./App.css";
import Paper from "@mui/material/Paper";
import SearchBar from "./components/searchBar";
import { EditingState } from "@devexpress/dx-react-grid";
import {Grid,Table,TableHeaderRow,TableEditRow,TableEditColumn} from "@devexpress/dx-react-grid-material-ui";

const getRowId = (row) => row.id;

const App = () => {

  /**
   * State Management
   */

  const [columns] = useState([
    { name: "name", title: "Name" },
    { name: "phone", title: "phone" },
    { name: "email", title: "email" },
  ]);

  const [rows, setRows] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState([]);

  //On page Start the list data gets fetched from the api
  useEffect(() => {
    fetchData();
  }, []);

  //to Display the Api results in the console
  useEffect(() => {
    console.table(users);
  }, [users]);

  //makes the Search bar dynamic
  useEffect(() => {
    const filteredRows = filterRows(searchValue);
    setRows(filteredRows);
  }, [searchValue]);

  
  /**
   * Here is the table logic
   * 3 seperate states that invoke their own functions
   * @added - creating a user
   * @changed - updating a user
   * @deleted - to remove a user
   * 
   */
  const commitChanges = ({ added, changed, deleted }) => {
    let changedRows;

    if (added) {
      //updates frontend
      const startingAddedId =
        rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
      changedRows = [
        ...rows,
        ...added.map((row, index) => ({
          id: startingAddedId + index,
          ...row,
        })),
      ];
      //api Update
      onAdd(...added)
    }

    if (changed) {
      //updates frontend
      changedRows = rows.map((row) =>
        changed[row.id] ? { ...row, ...changed[row.id] } : row
      );
      //api Update
      onUpdate(changed);
    }

    if (deleted) {
      //updates frontend
      const deletedSet = new Set(deleted);
      changedRows = rows.filter((row) => !deletedSet.has(row.id));
      onDelete(deleted[0]);
    }
    //api Update
    setRows(changedRows);
  };

  /**
   * Filter Logic for the search bar
   * it interacts with a @useEffect above
   */
  const filterRows = (searchValue) => {
    // if (searchValue === "") {
    //   setRows(rows);
    // }

    return rows.filter((row) => {
      return row.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  };


/**
 * API Functionality
 * @CRUD operations are triggered here
 * @fetchData , @onAdd , @onDelete , @onUpdate
 */

//On page load this triggers
  const fetchData = async () => {
    await fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setRows(data);
      })

      .catch((err) => {
        console.log(err);
      });
  };

  //when a user gets added by the front end, this function triggers
  //updates the placeholder api with new user details
  const onAdd = async (name,phone,email) => {
    await fetch("https://jsonplaceholder.typicode.com/users", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        phone: phone,
        email: email,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => {
        if (res.status !== 201) {
          return;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        console.log(data,"data")
        setUsers((users) => [...users, data]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // when user is deleted this updates the placeholder API
  const onDelete = async (id) => {
    await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.status !== 200) {
          return;
        } else {
          setUsers(
            users.filter((user) => {
              return user.id !== id;
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //Updates the API with new user data
  const onUpdate = async (data) => {
    if (!Object.keys(data)[0]) return;
    let key = Object.keys(data)[0];
    let changedDetails = data[key];

    let name;
    let phone;
    let email;

    //checks which data has been updated, to replace said values
    if (changedDetails.name) {
      name = changedDetails.name;
    } else {
      name = users[key - 1].name;
    }
    if (changedDetails.phone) {
      phone = changedDetails.phone;
    } else {
      phone = users[key - 1].phone;
    }
    if (changedDetails.email) {
      email = changedDetails.email;
    } else {
      email = users[key - 1].email;
    }

    //API request to update details
    await fetch(`https://jsonplaceholder.typicode.com/posts/${key}`, {
      method: "PUT",
      body: JSON.stringify({
        id: key,
        name: name,
        email: email,
        phone: phone,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => {
      if (response.status !== 200) {
        return;
      } else {
        let newData = users;

        //placeholder Update
        newData[key - 1].name = name;
        newData[key - 1].email = email;
        newData[key - 1].phone = phone;
        setUsers(newData);
      }
    });
  };

  /**
   * HTML rendering
   * calling @SearchBar from components folder
   */
  
  return (
    <div className="App">
      <h3>Friend-Keeper</h3>

      <br />
      <SearchBar
        callback={(innerValue) => {
          setSearchValue(innerValue);
        }}
      ></SearchBar>
      <Paper>
        <Grid rows={rows} columns={columns} getRowId={getRowId}>
          <EditingState onCommitChanges={commitChanges} />
          <Table />
          <TableHeaderRow />
          <TableEditRow />
          <TableEditColumn showAddCommand showEditCommand showDeleteCommand />
        </Grid>
      </Paper>
    </div>
  );
};

//Firebase hosting 
const firebaseConfig = {
  apiKey: "AIzaSyAAC_04nLOg3ICCW9Qmbe4Y5GOcepy_pBA",
  authDomain: "friend-keeper-4e151.firebaseapp.com",
  projectId: "friend-keeper-4e151",
  storageBucket: "friend-keeper-4e151.appspot.com",
  messagingSenderId: "171722578772",
  appId: "1:171722578772:web:9e5bb5a25415a1eda986c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default App;
