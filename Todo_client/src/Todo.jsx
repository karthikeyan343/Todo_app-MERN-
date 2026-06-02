import { useEffect, useState } from 'react';
import ServerWakeMessage from './ServerWakeMessage';

const Todo = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    let [title,setTitle] = useState("");
    let [description,setDesc] = useState("");
    let [todos,setTodos] = useState([]);
    let [error,setError] = useState("");
    let [msg,setMsg]  = useState("");
    let [loading,setLoading] = useState(true);
    let [saving,setSaving] = useState(false);

    let [editId,setEditId]= useState(-1);
    let [editTitle,setEdiTitle] = useState("");
    let [editDescription,setEditDesc] = useState("");

    let handleTitle = (e)=>{
      setTitle(e.target.value);
    }
    let handleDesc = (e)=>{
        setDesc(e.target.value);
    }
    const handleSubmit = ()=>{
      setError("");
      console.log("clicked");
      if(title.trim() != '' && description.trim() != ''){
        setSaving(true);
       fetch(apiUrl+"/todos",{
        method: "POST",
        headers:{
          'content-type' : 'application/json'
        },
        body:JSON.stringify({title,description})
       }).then((res)=>{
        if(res.ok){
        setTodos([...todos,{title,description}]);
        setTitle("");
        setDesc("");
        setMsg("Item added successfully");
        setTimeout(()=>{
          setMsg("");
        },3000);
        }}).catch((err)=>{
        console.log(err);
        setError("unable to create todo")})
        .finally(() => setSaving(false))
      }
    };
    const handleEdit = (item)=>{
       setEditId(item._id);
       setEdiTitle(item.title);
       setEditDesc(item.description);
    }
    const handleEditCancel = ()=>{
      setEditId(-1);
    }
    const handleUpdate = ()=>{
       setError("");
      console.log("clicked");
      if(editTitle.trim() != '' && editDescription.trim() != ''){
        setSaving(true);
       fetch(apiUrl+"/todos/"+editId,{
        method: "PUT",
        headers:{
          'content-type' : 'application/json'
        },
        body:JSON.stringify({title: editTitle,description: editDescription})
       }).then((res)=>{
        if(res.ok){
          const updatedTodo = todos.map((item)=>{
            if(item._id == editId){
              item.title = editTitle;
              item.description = editDescription;
            }
            return item;
          })
        setTodos(updatedTodo);
        setEdiTitle("");
        setEditDesc("");
        setMsg("Item updated successfully");
        setTimeout(()=>{
          setMsg("");
        },3000);

        setEditId(-1);
        }
      }).catch((err)=>{
        console.log(err);
        setError("unable to create todo")})
        .finally(() => setSaving(false))
      }
    };

    const handleDelete=(id)=>{
          if(window.confirm("Are you sure to Delete This Item")){
          fetch(apiUrl+"/todos/"+id,{method:"DELETE"})
         .then(()=>{
          const updatedTodo =  todos.filter((item)=>item._id !== id);
          setTodos(updatedTodo);
          })}
        };

    useEffect(()=>{
      let cancelled = false;

      fetch(apiUrl+"/todos")
      .then((res)=> res.json())
      .then((res)=>{
        if (!cancelled) {
          setTodos(res);
        }
      })
      .catch((err) => {
        console.log(err);
        if (!cancelled) {
          setError("Unable to load tasks. Please wait and refresh once the server wakes up.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

      return () => {
        cancelled = true;
      };
    },[apiUrl]);

return (
<div className="container mt-4">

  <div className="row justify-content-center">
    <div className="col-12 col-md-8 col-lg-7">

      {/* Header */}
      <div
        className="p-3 text-white text-center rounded shadow-sm"
        style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
      >
        <h3 className="mb-0">TaskFlow – MERN Stack Task Management Application</h3>
      </div>

      {/* Add Item */}
      <div className="mt-4">

        <h4>Add Item</h4>

        {msg && <p className="text-success">{msg}</p>}
        {saving && <ServerWakeMessage title="Connecting to server..." />}

        <div className="row g-2">

          <div className="col-12 col-md-5">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={handleTitle}
              className="form-control"
            />
          </div>

          <div className="col-12 col-md-5">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={handleDesc}
              className="form-control"
            />
          </div>

          <div className="col-12 col-md-2">
            <button
              className="btn btn-dark w-100"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Please wait...' : 'Submit'}
            </button>
          </div>

        </div>

        {error && <p className="text-danger mt-2">{error}</p>}

      </div>

      {/* Task List */}
      <div className="mt-4">

        <h4>Task</h4>

        {loading && <ServerWakeMessage title="Loading tasks..." />}

        <ul className="list-group">

          {!loading && todos.map((item) => (
            <li
              key={item._id}
              className="list-group-item bg-light shadow-sm rounded my-2"
            >

              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">

                {/* Task Content */}
                <div>

                  {editId === -1 || editId !== item._id ? (

                    <>
                      <div className="fw-bold">{item.title}</div>
                      <div className="text-muted">{item.description}</div>
                    </>

                  ) : (

                    <div className="d-flex flex-column flex-md-row gap-2">

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEdiTitle(e.target.value)}
                        className="form-control"
                      />

                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="form-control"
                      />

                    </div>

                  )}

                </div>

                {/* Buttons */}
                <div className="d-flex gap-2">

                  {editId === -1 || editId !== item._id ? (

                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                  ) : (

                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleUpdate}
                      disabled={saving}
                    >
                      {saving ? 'Please wait...' : 'Update'}
                    </button>

                  )}

                  {editId === -1 || editId !== item._id ? (

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>

                  ) : (

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>

                  )}

                </div>

              </div>

            </li>
          ))}

        </ul>

      </div>

    </div>
  </div>

</div>
)
}

export default Todo
