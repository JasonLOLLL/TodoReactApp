import React, { useEffect, useState} from 'react';
import { nanoid } from 'nanoid';
import './App.css'; 
import { TodoType } from './index';
import Todo from './components/Todo';
import Form from './components/Form';
import FilterButton from './components/FilterButton';
import axios from 'axios';

const API_URL = 'http://10.0.0.25:8000/api/todos/';

const FILTER_MAP = {
  All: () => true,
  Active: (task : TodoType) => !task.completed,
  Completed: (task : TodoType) => task.completed 
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function App(props : {tasks? : any}) { //HOW DOES TYPING WORK
  const [tasks, setTasks] = useState(props.tasks);
  const [filter, setFilter] = useState('All');
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(API_URL)
    .then(r => {
      setTasks(r.data)
    })
    .catch((e) => console.log(e));

  }, []);

  function toggleTaskCompleted(id : string) {

    const updatedTasks = tasks.map((task : any) => {
      if (id===task.id) {
        return {...task, completed: !task.completed}
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id : string) {
    const remainingTasks = tasks.filter((task : any) => task.id!==id);
    setTasks(remainingTasks);

    axios.delete(API_URL + id + "/");
  }

  function addTask(name : string) {
    axios.post(API_URL, {
      name: name,
      completed: false
    })
    .then(r =>{
      const newTask = {id: r.data.id, name, completed:false};
      setTasks([...tasks, newTask]);
    })
    .catch(e => console.log(e));
  }

  function editTask(id : string, newName : string) {
    const editedTaskList = tasks.map((task : TodoType) => {
      if (task.id===id) {
        return {...tasks, name:newName};
      }
      return task;
    })

    setTasks(editedTaskList);

    axios.patch(API_URL + id + "/", {
      name: newName
    })
  }
  
  const taskList = tasks
  .filter(FILTER_MAP[filter as keyof typeof FILTER_MAP])
  .map((task : TodoType) => 
    <Todo 
      name={task.name} 
      completed={task.completed} 
      id={task.id} 
      key={task.id}
      toggleTaskCompleted={toggleTaskCompleted}
      deleteTask={deleteTask}
      editTask={editTask}
    />);

  
  const filterList : any = FILTER_NAMES.map((name) => (
    <FilterButton key={name} name={name} isPressed={name===filter} setFilter={setFilter}/>
  ))

  const tasksNoun : string = taskList.length !== 1 ? 'tasks' : 'task';
  const headingText = `${taskList.length} ${tasksNoun} remaining`;


  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask}/>
      <div className="filters btn-group stack-exception">
        {filterList}
      </div>
      <h2 id="list-heading">
        {headingText}
      </h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;
