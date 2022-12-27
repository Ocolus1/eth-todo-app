import Head from 'next/head';
import "bootstrap/dist/css/bootstrap.min.css";
import React, {  useState, useEffect } from 'react';
import Header from '../components/header';
import { ethers } from "ethers";
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from '../config';
import Script from 'next/script'

const data = [
  {
    id: 1,
    title: 'A first item - This is a dummy',
  },
  { 
    id: 2,
    title: 'A second item',
  },
  {
    id: 3,
    title: 'A third item',
  },
]


export default function Home() {
	const [tasks, setTasks] = useState("");
	const [todoList, setTodoList] = useState([]);
	const [daiContract, setDaiContract] = useState(null);
	const [signer, setSigner] = useState(null);
	const [taskCount, setTaskCount] = useState(0);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // calls the function at first render
    connectToMetamask()
  }, [])

  const connectToMetamask = async () => {
    // Get the ethereum provider 
		const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Gets the list of account in the wallet
		const accounts = await provider.send("eth_requestAccounts", []);

    // Gets the signer from the provider
    const signer = provider.getSigner();

    // store the instance of the signer in react state
    setSigner(signer);

    // set the first address as the default address
		setAccount(accounts[0]);

    // create a contract instance from the ABI and the contract address
    const daiContract = new ethers.Contract(TODO_LIST_ADDRESS, TODO_LIST_ABI, provider);

    // store the instance of the contract in react state
    setDaiContract(daiContract);

    // calls the getTasks function to get the tasks from the blockchain
    const taskCount = await daiContract.taskCount();
    setTaskCount(taskCount);

    // create an empty list 
    let _tasks = [];

    // loop through the taskCount and get the task from the blockchain
    for (var i = 1; i <= taskCount; i++) {
      // call each task from the blockchain and append it to _task
      const task = await daiContract.tasks(i);
      _tasks.push(task);
    }
    
    // update the react state with the new list
    setTodoList(_tasks);
    setLoading(false);
	}

	const addTask = () => {
    // Only runs the function if the input is not empty
    if (tasks != "") {
      setLoading(true);
      // create a contract signer from the signer instance in react state
      const daiContractWithSigner = daiContract.connect(signer);
      daiContractWithSigner.createTask(tasks)
      .then((tx) => {
        return tx.wait();
      })
      .then( async (tx) => {
        // calls the connectToMetamask function to update the react state
        await connectToMetamask();
        setLoading(false);
      })
      .catch((error) => {
          console.error(error);
          setLoading(false);
      });
    } 
	};

	const toggleCompleted = (id) => {
    setLoading(true);
    // create a contract signer from the signer instance in react state
    const daiContractWithSigner = daiContract.connect(signer);
    daiContractWithSigner.toggleCompleted(id)
    .then((tx) => {
      return tx.wait();
    })
    .then( async (tx) => {
      // calls the connectToMetamask function to update the react state
      await connectToMetamask();
      setLoading(false);
    })
    .catch((error) => {
        console.error(error);
        setLoading(false);
    });
  };

  const ifEmpty = () => {
    // Checks if the list is empty and renders a default value
    if (!todoList.length) {
      return (
        <>
          {data.map((item) => {
            return <p className="list-group-item" key={item.id}>{item.title}</p>
          })}
        </>
      )
    } else {
      return (
        <>
          {/** Renders the todolist data that was gotten from the blockchain */}
          {todoList?.map((item, key) => {
            return (
              <div className="form-check" key={key}>
                <input className="form-check-input" type="checkbox" 
                defaultChecked={item.completed} 
                onClick={() => toggleCompleted(item.id)}/>
                <label className={`form-check-label ${item.completed ? 'text-decoration-line-through' : ''}`} 
                  htmlFor="flexCheckChecked">
                  {item.content}
                </label>
              </div>
            )
          })}
        </>
      )
    }
  }

	return (
		<>
			<Head>
				<title>CRYPTO TODOLIST</title>
				<meta
					name="description"
					content="Generated by create next app"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.ico" /> 
      </Head>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" 
      integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" 
      crossorigin="anonymous"></Script>
			<main>
        {/** Passing the user ethereum address and the function to connect to the wallet. */}
				<Header account={account} connectToMetamask={connectToMetamask} />
				<div className="container mt-5">
					<div className="row justify-content-center">
            <div className='col-lg-6 col-sm-12 border'>
						<h1 className="text-center mb-4">Todo List</h1>
            {loading // checks if the asynchronous activity has completed before re-rendering
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : 
                  <div className="row mb-4">
                    <div className="col-lg-6 order-last order-lg-first">
                    <ul className="list-group">
                      {ifEmpty()} {/* renders the todo list */}
                    </ul>
                    </div>
                    <div className="col-lg-6">
                      <div className="">
                        <div className="mb-3 row">
                          <div className="col-12">
                            <form
                            onSubmit={(event) => {
                              event.preventDefault()
                              // call the addTask function to add the task to the blockchain
                              addTask();
                              // To restore the input to an empty string after submissin
                              setTasks("")
                            }}
                            >
                              <input
                                type="text"
                                value={tasks}
                                className="form-control"
                                placeholder="Tell me what you want to do...."
                                onChange={(e) => {
                                  // Sets the value of the input to tasks 
                                  setTasks(e.target.value);
                                }}
                              />
                              {/* A hidden input to submit without using a button */}
                              <input type="submit" hidden={true} />
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              }
            </div>
					</div>
				</div>
			</main>
		</>
	);
}
