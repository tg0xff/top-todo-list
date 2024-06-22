import "./style.css";
import {
  mdiCheckCircle,
  mdiCloseCircle,
  mdiPlusCircle,
  mdiMenuRight,
  mdiCheck,
  mdiDelete,
  mdiCalendarClock,
} from "@mdi/js";

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
  const makeButton = (className, iconData, size) => {
    const button = document.createElement("button");
    button.className = className;
    const btnIcon  = makeIconSvg(iconData, size, className);
    button.appendChild(btnIcon);
    return button;
  };
  const newTaskBtn = (() => {
    const button = makeButton("new-task", mdiPlusCircle, 24);
    body.appendChild(button);
    return button;
  })();
  const addTaskForm = () => {
    const task = document.createElement("div");
    task.classList.add("task");
    const form = document.createElement("span");
    form.classList.add("new-task-form");
    const title = document.createElement("input");
    title.type = "text";
    const btnSize = 24;
    const ok = makeButton("new-task-ok", mdiCheckCircle, btnSize);
    const cancel = makeButton("new-task-cancel", mdiCloseCircle, btnSize);
    form.appendChild(title);
    form.appendChild(ok);
    form.appendChild(cancel);
    task.appendChild(form);
    body.insertBefore(task, newTaskBtn);
  };
  const createTaskButtons = () => {
    const span = document.createElement("span");
    span.className = "task-buttons";
    const btnSize = 24;
    const done = makeButton("task-done", mdiCheck, btnSize);
    const schedule = makeButton("task-schedule", mdiCalendarClock, btnSize);
    const deleteTask = makeButton("task-delete", mdiDelete, btnSize);
    span.appendChild(done);
    span.appendChild(schedule);
    span.appendChild(deleteTask);
    return span;
  };
  const findParentElement = (e, className) => {
    let task = e.target.parentNode;
    do {
      task = task.parentNode;
    } while (!task.classList.contains(className));
    return task;
  };
  const createNewTask = (e) => {
    const form = findParentElement(e, "new-task-form");
    const task = form.parentNode;
    const titleInput = form.querySelector("input");
    const taskId = Storage.newTodo(titleInput.value, 0);
    task.setAttribute("data-id", taskId);
    form.remove();

    const taskHeader = document.createElement("span");
    const foldArrow = document.createElement("span");
    const title = document.createElement("span");
    const scheduled = document.createElement("span");
    taskHeader.classList.add("task-header");
    const foldClass = "task-fold-arrow";
    foldArrow.classList.add(foldClass);
    const foldIcon = makeIconSvg(mdiMenuRight, 18, foldClass);
    title.classList.add("task-title");
    title.textContent = titleInput.value;
    scheduled.className = "scheduled";
    foldArrow.appendChild(foldIcon);
    taskHeader.appendChild(foldArrow);
    taskHeader.appendChild(title);
    taskHeader.appendChild(scheduled);
    const taskButtons = createTaskButtons();
    taskHeader.appendChild(taskButtons);
    task.appendChild(taskHeader);
  };
  const cancelTaskForm = (e) => {
    const task = findParentElement(e, "task");
    task.remove();
  };
  const toggleTaskDone = (e) => {
    const task = findParentElement(e, "task");
    const title = task.querySelector(".task-title");
    const taskId = task.getAttribute("data-id");
    Storage.toggleTodo(taskId);
    const doneState = Storage.isTaskDone(taskId);
    if (doneState) {
      title.classList.add("done");
    } else {
      title.classList.remove("done");
    }
  };
  const deleteTask = (e) => {
    const task = findParentElement(e, "task");
    const taskId = task.getAttribute("data-id");
    Storage.deleteTask(taskId);
    task.remove();
  };
  const click = function (e) {
    const classes = {
      "new-task": addTaskForm,
      "new-task-ok": createNewTask,
      "new-task-cancel": cancelTaskForm,
      "task-done": toggleTaskDone,
      "task-delete": deleteTask,
    };
    for (const className in classes) {
      if (e.target.classList.contains(className)) {
        classes[className](e);
        return;
      }
    }
  };
  body.addEventListener("click", click);
})();

class Todo {
  #priority = 1;
  constructor(title, nestedLvl) {
    this.title = title;
    this.description = "";
    this.dueDate = "";
    this.done = false;
    this.nestedLvl = nestedLvl;
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
  static storage = {
    todos: [],
    topLvl: [],
  };
  static newTodo(title, nestedLvl) {
    const todoItem = new Todo(title, nestedLvl);
    const todoId = this.storage.todos.push(todoItem) - 1;
    if (nestedLvl === 0) {
      this.storage.topLvl.push(todoId);
    }
    return todoId;
  }
  static toggleTodo(id) {
    this.storage.todos[id].toggleDone();
  }
  static isTaskDone(id) {
    return this.storage.todos[id].done;
  }
  static deleteTask(id) {
    this.storage.todos[id] = null;
    const index = this.storage.topLvl.indexOf(id);
    if (index !== -1) {
      this.storage.topLvl.splice(index, 1);
    }
  }
}
