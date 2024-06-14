import "./style.css";
import { mdiCheckCircle, mdiCloseCircle } from "@mdi/js";

const UI = (() => {
  const body = document.querySelector("body");
  const newTaskBtn = body.querySelector("#new-task");
  const makeIconSvg = function (iconData) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("height", "24px");
    svg.setAttribute("width", "24px");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", iconData);
    svg.appendChild(path);
    return svg;
  };
  const clickBtn = function (e) {
    switch (e.target.id) {
      case "new-task":
        addTask();
        break;
    }
  };
  const addTask = () => {
    const task = document.createElement("div");
    task.classList.add("task");
    const form = document.createElement("span");
    form.classList.add("new-task-form");
    const title = document.createElement("input");
    title.type = "text";
    title.setAttribute("required", "");
    const ok = document.createElement("button");
    ok.classList.add("new-task-ok");
    const okIcon = makeIconSvg(mdiCheckCircle);
    ok.appendChild(okIcon);
    const cancel = document.createElement("button");
    cancel.classList.add("new-task-cancel");
    const cancelIcon = makeIconSvg(mdiCloseCircle);
    cancel.appendChild(cancelIcon);

    form.appendChild(title);
    form.appendChild(ok);
    form.appendChild(cancel);
    task.appendChild(form);
    body.insertBefore(task, newTaskBtn);
  };
  body.addEventListener("click", clickBtn);
  return {};
})();

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
