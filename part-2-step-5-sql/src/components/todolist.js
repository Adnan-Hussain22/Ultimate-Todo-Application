import React, { Component } from 'react'
import Modal from "react-responsive-modal";
import { Observable } from "rxjs"
import swal from "sweetalert";
import { apiEndPoint } from "../ApiEndPoint";
import ListContainer from "./ListContainer";
class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            todos: [],
            text: '',
            desc: '',
            open: false,
            updatedTitle: '',
            updatedDescription: '',
            ref: undefined
        }
        this.downloadAllTodos = this.downloadAllTodos.bind(this);
        this.addTodos = this.addTodos.bind(this);
        this.onchangeTodo = this.onchangeTodo.bind(this);
        this.onchangeDesc = this.onchangeDesc.bind(this);
        this.onOpenModal = this.onOpenModal.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this.updateFunction = this.updateFunction.bind(this);
        this.getSpecificTask = this.getSpecificTask.bind(this);
        this.handleDoneStatus = this.handleDoneStatus.bind(this);
    };

    componentDidMount() {
        this.downloadAllTodos();
    }

    // +========= Get All Todos ==========+
    downloadAllTodos() {
        const fetchAllTodosObserver$ = Observable.create(observer => {
            fetch('https://ultimate-todo-web-postgres.herokuapp.com/todo/api/v1.0/todos')
                .then(res => res.json())
                .then(todos => {
                    observer.next(todos);
                    observer.complete();
                })
        });

        fetchAllTodosObserver$.subscribe(todos => this.setState({
            todos
        }))

    }

    // ****** modal's controllers *******
    onOpenModal(id, that) {
        this.setState({ open: true });
        localStorage.setItem('id', id);
        console.log(that);
        this.setState({
            ref: that
        })
    };

    onCloseModal() {
        this.setState({ open: false });
    };

    // +============ add a todo ===========+

    addTodos(e) {
        e.preventDefault();
        fetch(`https://ultimate-todo-web-postgres.herokuapp.com/todo/api/v1.0/todos`, {
            method: "POST",
            body: JSON.stringify({
                title: this.state.text,
                description: this.state.desc,
                done: false
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(jsondocs => jsondocs.json())
            .then(doc => {
                console.log(doc);
                if (doc) {
                    this.downloadAllTodos();
                }
                swal('Task added!')
            })
            .catch(error => {
                console.log(error)
            });
    }

    onchangeDesc(e) {
        this.setState({ desc: e.target.value });
    }

    onchangeTodo(e) {
        this.setState({ text: e.target.value });
    }


    // +=============== remove a todo ==============+
    removeTodo(id, that) {
        console.log(that);
        const removeObservabl$ = Observable.create(obs => {
            fetch(`https://ultimate-todo-web-postgres.herokuapp.com/todo/api/v1.0/todos/${id}`, {
                method: "delete"
            })
                .then(res => res.json())
                .then(data => {
                    obs.next(data);
                    obs.complete();
                })
                .catch(err => console.log(err));
        });
        removeObservabl$.subscribe(data => {
            console.log(data)
            that.downloadAllTodos()
            swal('Task deleted!', 'Your task has been deleted.', 'success');
        })

    }

    // + ============= get a specific Todo =============+

    getSpecificTask(id) {
        console.log(id);
        fetch(`${apiEndPoint.link}`, {
            method: "GET"
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.log(err))
    }


    handleDoneStatus(id, status) {

        const updateDoneTaskObs$ = Observable.create(obs => {
            fetch(`https://ultimate-todo-web-postgres.herokuapp.com/todo/api/v1.0/todos/done/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    done: status
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.json())
                .then(data => {
                    obs.next(data);
                    obs.complete();
                })
        });

        updateDoneTaskObs$.subscribe(data => {
            this.downloadAllTodos();
            swal('Task done status updated!', 'Thanks for using me!', 'success');
        });

    }

    // +================== update a todo ==============+

    updateFunction(e) {
        e.preventDefault();
        const id = localStorage.getItem('id');
        console.log(id);
        let todoObject = {
            title: this.state.updatedTitle,
            description: this.state.updatedDescription
        }
        const updateATodoObservable$ = Observable.create(obs => {
            fetch(`https://ultimate-todo-web-postgres.herokuapp.com/todo/api/v1.0/todos/487474aa-1dcf-4cbc-a085-e86302db0792`, {
                method: "PUT",
                body: JSON.stringify(todoObject),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(res => res.json())
                .then(data => {
                    obs.next(data);
                    obs.complete();
                })
        });
        updateATodoObservable$.subscribe(data => {
            console.log(data);
            this.state.ref.downloadAllTodos();
            this.onCloseModal();
            swal('Task updated!', 'Your task has been upadated.', 'success');
        });
    };


    // + ====================== render method ================+
    render() {
        const { open } = this.state;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-6 offset-md-3">
                        <div>
                            <br /><br />
                            <h3 className="text-danger">Ulitmate TodoList</h3>
                            <form onSubmit={this.addTodos}>
                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <input type="text" required value={this.state.text} onChange={this.onchangeTodo} className="form-control form-control-sm" aria-describedby="emailHelp" placeholder="Enter Todos" /> <br />
                                        <input type="text" required value={this.state.desc} onChange={this.onchangeDesc} className="form-control form-control-sm" aria-describedby="emailHelp" placeholder="Enter Description" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-4">
                                        <label htmlFor="test">&nbsp;</label>
                                        <button type="submit" className="btn btn-primary btn-sm">Insert Todo</button>
                                    </div>
                                </div>

                            </form>
                            <h4>All Todos</h4>
                            {this.state.todos.map((todo, i) => {
                                return (
                                    <ListContainer
                                        index={i + 1}
                                        todoId={todo.id}
                                        title={todo.title}
                                        description={todo.description}
                                        status={todo.done}
                                        removeFunction={this.removeTodo}
                                        updateStatusFunction={this.handleDoneStatus}
                                        onOpenModal={this.onOpenModal}
                                        that={this}
                                    />
                                )

                            })}

                        </div>
                    </div>
                </div>
                <Modal open={open} onClose={this.onCloseModal} center>
                    <form onSubmit={this.updateFunction}>
                        <div classNatesttestme="form-row">
                            <div className="form-group col-md-12">
                                <input
                                    type="text"
                                    onChange={(e) => { this.setState({ updatedTitle: e.target.value }) }}
                                    className="form-control form-control-sm"

                                    placeholder="Enter Todos"

                                /> <br />
                                <input
                                    type="text"
                                    onChange={(e) => { this.setState({ updatedDescription: e.target.value }) }}
                                    className="form-control form-control-sm"

                                    placeholder="Enter Description" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-4">
                                <label htmlFor="test">&nbsp;</label>
                                <button type="submit" className="btn btn-primary btn-sm">Insert Todo</button>
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>

        )
    }

}

export default TodoList;


