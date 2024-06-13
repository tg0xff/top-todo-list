class UI {
  static #body = document.querySelector("body");
  static #newTask = this.#body.querySelector("#new-task");
  static #clickBtn(e) {
    switch (e.target.id) {
      case "new-task":
        this.#addTask();
        break;
    }
  }
  static #addTask() {
    const task = document.createElement("div");
    task.classList.add("task");
    const form = document.createElement("span");
    form.classList.add("new-task-form")
    const title = document.createElement("input");
    title.type = "text";
    title.setAttribute("required", "");
    const ok = document.createElement("button");
    ok.classList.add("new-task-ok");
    ok.textContent = "Ok";
    const cancel = document.createElement("button");
    cancel.classList.add("new-task-cancel");
    cancel.textContent = "Cancel";

    form.appendChild(title);
    form.appendChild(ok);
    form.appendChild(cancel);
    task.appendChild(form);
    this.#body.insertBefore(task, this.#newTask);
  }
}

class Todo {
  #priority = 1;
  constructor(title) {
    this.title = title;
    this.description = "";
    this.dueDate = "";
    this.done = false;
    this.nested = [];
  }
  set priority(lvl) {
    if (lvl >= 0 && lvl <= 2) {
      this.#priority = lvl;
    }
  }
  get priority() {
    return this.#priority;
  }
  isProject() {
    return this.nested.length > 0;
  }
  toggleDone() {
    this.done = !this.done;
  }
}

class Storage {
  static storage = [];
  static newTodo(title) {
    const todoItem = new Todo(title);
    this.storage.push(todoItem);
  }
}
