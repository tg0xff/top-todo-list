import "./style.css";
import { mdiCheckCircle, mdiCloseCircle, mdiPlusCircle } from "@mdi/js";

const UI = (() => {
  const body = document.querySelector("body");
  const makeIconSvg = function (iconData, size, btnClass) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("height", `${size}px`);
    svg.setAttribute("width", `${size}px`);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", iconData);
    if (btnClass) {
      path.classList.add(btnClass);
      svg.classList.add(btnClass);
    }
    svg.appendChild(path);
    return svg;
  };
  const newTaskBtn = (() => {
    const button = document.createElement("button");
    const btnClass = "new-task";
    button.classList.add();
    const btnIcon = makeIconSvg(mdiPlusCircle, 24, btnClass);
    button.appendChild(btnIcon);
    body.appendChild(button);
    return button;
  })();
  const addTask = () => {
    const task = document.createElement("div");
    task.classList.add("task");
    const form = document.createElement("span");
    form.classList.add("new-task-form");
    const title = document.createElement("input");
    title.type = "text";
    title.setAttribute("required", "");
    const ok = document.createElement("button");
    const okClass = "new-task-ok";
    ok.classList.add(okClass);
    const okIcon = makeIconSvg(mdiCheckCircle, 24, okClass);
    ok.appendChild(okIcon);
    const cancel = document.createElement("button");
    const cancelClass = "new-task-cancel";
    cancel.classList.add(cancelClass);
    const cancelIcon = makeIconSvg(mdiCloseCircle, 24, cancelClass);
    cancel.appendChild(cancelIcon);

    form.appendChild(title);
    form.appendChild(ok);
    form.appendChild(cancel);
    task.appendChild(form);
    body.insertBefore(task, newTaskBtn);
  };
  const clickBtn = function (e) {
    if (e.target.classList.contains("new-task")) {
      addTask();
    }
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
