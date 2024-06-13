class UI {
  static #body = document.querySelector("body");
  static #newTask = this.#body.querySelector("#new-task");
  static #clickBtn(e) {
    switch (e.target.id) {
      case "new-task":
        this.#newTask();
        break;
    }
  }
  constructor() {
    UI.#body.addEventListener("click", UI.#clickBtn);
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
