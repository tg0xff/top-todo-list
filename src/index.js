import "./style.css";
import {
  mdiCheckCircle,
  mdiCloseCircle,
  mdiPlusCircle,
  mdiMenuRight,
  mdiCheck,
  mdiDelete,
  mdiCalendarClock,
  mdiPencil,
  mdiMenuDown,
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
    const btnIcon = makeIconSvg(iconData, size, className);
    button.appendChild(btnIcon);
    return button;
  };
  const findParentElement = (e, className) => {
    let parent = e.target.parentNode;
    do {
      parent = parent.parentNode;
    } while (!parent.classList.contains(className));
    return parent;
  };
  const makeFoldIcon = (fold) => {
    const className = fold ? "task-fold-arrow" : "task-unfold-arrow";
    const iconData = fold ? mdiMenuDown : mdiMenuRight;
    const foldIcon = document.createElement("span");
    foldIcon.className = className;
    const taskFoldIcon = makeIconSvg(iconData, 18, className);
    foldIcon.appendChild(taskFoldIcon);
    return foldIcon;
  };
  const calcTaskIndent = (task) => {
    const taskId = task.getAttribute("data-id");
    const indentMultiplier = Storage.getNestedLvl(taskId) + 1;
    const taskIndentVar = getComputedStyle(document.body).getPropertyValue("--task-indentation");
    const indentMargin = Number(taskIndentVar.slice(0, -2)) * indentMultiplier;
    return `${indentMargin}px`;
  };
  const addDescriptionElements = (task) => {
    const taskId = task.getAttribute("data-id");
    const contents = task.querySelector(".task-contents");
    const nested = contents.querySelector(".nested")
    const description = document.createElement("div");
    description.className = "task-description";
    description.textContent = Storage.getDescription(taskId);
    contents.insertBefore(nested, description);
    const descButtons = document.createElement("div");
    descButtons.className = "task-description-buttons";
    contents.insertBefore(nested, description);
    const editDescriptionBtn = makeButton("task-edit-description", mdiPencil, 24);
    descButtons.appendChild(editDescriptionBtn);
  };
  const newTaskBtn = (() => {
    const button = makeButton("new-task", mdiPlusCircle, 24);
    body.appendChild(button);
    return button;
  })();
  const newTaskFormBtn = () => {
    const task = document.createElement("div");
    task.classList.add("task");
    body.insertBefore(task, newTaskBtn);
    const form = document.createElement("span");
    form.classList.add("new-task-form");
    task.appendChild(form);
    const title = document.createElement("input");
    title.type = "text";
    form.appendChild(title);
    const btnSize = 24;
    const ok = makeButton("new-task-ok", mdiCheckCircle, btnSize);
    form.appendChild(ok);
    const cancel = makeButton("new-task-cancel", mdiCloseCircle, btnSize);
    form.appendChild(cancel);
  };
  const createTaskButtons = () => {
    const span = document.createElement("span");
    span.className = "task-buttons";
    const btnSize = 24;
    const done = makeButton("task-done", mdiCheck, btnSize);
    span.appendChild(done);
    const schedule = makeButton("task-schedule", mdiCalendarClock, btnSize);
    span.appendChild(schedule);
    const editTaskTitle = makeButton("task-edit-title", mdiPencil, btnSize);
    span.appendChild(editTaskTitle);
    const deleteTask = makeButton("task-delete", mdiDelete, btnSize);
    span.appendChild(deleteTask);
    return span;
  };
  const newTaskOkBtn = (e) => {
    const form = findParentElement(e, "new-task-form");
    const task = form.parentNode;
    const titleInput = form.querySelector("input");
    const taskId = Storage.newTodo(titleInput.value, 0);
    task.setAttribute("data-id", taskId);
    form.remove();

    const taskHeader = document.createElement("span");
    taskHeader.className = "task-header";
    task.appendChild(taskHeader);
    const foldArrow = makeFoldIcon(false);
    taskHeader.appendChild(foldArrow);
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = titleInput.value;
    taskHeader.appendChild(title);
    const scheduled = document.createElement("span");
    scheduled.className = "scheduled";
    taskHeader.appendChild(scheduled);
    const taskButtons = createTaskButtons();
    taskHeader.appendChild(taskButtons);
  };
  const newTaskCancelBtn = (e) => {
    const task = findParentElement(e, "task");
    task.remove();
  };
  const taskDoneBtn = (e) => {
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
  const taskDeleteBtn = (e) => {
    const task = findParentElement(e, "task");
    const taskId = task.getAttribute("data-id");
    Storage.deleteTask(taskId);
    task.remove();
  };
  const taskScheduleBtn = (e) => {
    const dialog = body.querySelector("dialog");
    const task = findParentElement(e, "task");
    dialog.setAttribute("data-id", task.getAttribute("data-id"));
    dialog.showModal();
  };
  const toggleHourWidget = (e) => {
    const input = body.querySelector("#hour");
    if (e.target.checked) {
      input.removeAttribute("disabled");
    } else {
      input.setAttribute("disabled", "");
    }
  };
  const setScheduleBtn = (e) => {
    e.preventDefault();
    const form = e.target.parentNode.parentNode;
    const dialog = form.parentNode;
    const taskId = dialog.getAttribute("data-id");
    const spanSchedule = body.querySelector(
      `div[data-id="${taskId}"] .scheduled`,
    );
    if (form.reportValidity()) {
      Storage.setDate(taskId, form.elements["date"].value);
      if (!form.elements["hour"].disabled) {
        Storage.setHour(taskId, form.elements["hour"].value);
      }
      form.reset();
      dialog.close();
      dialog.querySelector("#hour").setAttribute("disabled", "");
      spanSchedule.textContent = Storage.getDate(taskId);
    }
  };
  const closeScheduleFormBtn = (e) => {
    const dialog = findParentElement(e, "schedule-menu");
    const form = dialog.querySelector("form");
    form.reset();
    dialog.close();
    dialog.querySelector("#hour").setAttribute("disabled", "");
  };
  const taskEditTitleBtn = (e) => {
    const taskHeader = findParentElement(e, "task-header");
    const title = taskHeader.querySelector(".task-title");
    if (!title) {
      return;
    }
    title.remove();
    const scheduled = taskHeader.querySelector(".scheduled");
    const textWidget = document.createElement("input");
    textWidget.type = "text";
    taskHeader.insertBefore(textWidget, scheduled);
    const applyTitleBtn = makeButton("ok-title-change", mdiCheck, 24)
    taskHeader.insertBefore(applyTitleBtn, scheduled);
  };
  const okTitleChangeBtn = (e) => {
    const task = findParentElement(e, "task");
    const taskHeader = task.querySelector(".task-header");
    const taskId = task.getAttribute("data-id");
    const scheduled = taskHeader.querySelector(".scheduled");
    const textWidget = taskHeader.querySelector('input[type="text"]');
    Storage.changeTitle(taskId, textWidget.value);
    textWidget.remove();
    const okTitleChange = taskHeader.querySelector(".ok-title-change");
    okTitleChange.remove();
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = Storage.getTitle(taskId);
    taskHeader.insertBefore(title, scheduled);
  };
  const taskUnfoldArrow = (e) => {
    const task = findParentElement(e, "task");
    const taskId = task.getAttribute("data-id");

    const taskHeader = task.querySelector(".task-header");
    const taskTitle = taskHeader.querySelector(".task-title");
    taskHeader.querySelector(".task-unfold-arrow").remove();
    const taskFold = makeFoldIcon(true);
    taskHeader.insertBefore(taskFold, taskTitle);

    const contents = document.createElement("div");
    contents.className = "task-contents";
    contents.style.marginLeft = calcTaskIndent(task);
    task.appendChild(contents);
    const nested = document.createElement("div");
    contents.appendChild(nested);
    addDescriptionElements(task);
  };
  const taskFoldArrow = (e) => {
    const task = findParentElement(e, "task");
    const taskHeader = task.querySelector(".task-header");
    const taskTitle = taskHeader.querySelector(".task-title");
    taskHeader.querySelector(".task-fold-arrow").remove();
    const taskUnfold = makeFoldIcon(false);
    taskHeader.insertBefore(taskUnfold, taskTitle);
    task.querySelector(".task-contents").remove();
  };
  const taskEditDescriptionBtn = (e) => {
    const task = findParentElement(e, "task");
    const contents = task.querySelector(".task-contents");
    const nested = contents.querySelector(".nested");
    contents.querySelector(".task-description").remove()
    contents.querySelector(".task-description-buttons").remove()
    const textarea = document.createElement("textarea");
    textarea.className = "task-description";
    contents.insertBefore(textarea, nested);
    const descButtons = document.createElement("div");
    descButtons.className = "task-description-buttons";
    contents.insertBefore(descButtons, nested);
    const applyDescriptionBtn = makeButton("task-apply-description", mdiCheck, 24);
    descButtons.appendChild(applyDescriptionBtn);
  };
  const taskApplyDescriptionBtn = (e) => {
    const task = findParentElement(e, "task");
    const taskId = task.getAttribute("data-id");
    const contents = task.querySelector(".task-contents");
    const textarea = contents.querySelector("textarea");
    Storage.setDescription(taskId, textarea.value);
    textarea.remove();
    contents.querySelector(".task-description-buttons").remove();
    addDescriptionElements(task);
  };
  const click = function (e) {
    switch (e.target.id) {
      case "set-schedule":
        setScheduleBtn(e);
        return;
      case "close-schedule-form":
        closeScheduleFormBtn(e);
        return;
    }
    const classes = {
      "new-task": newTaskFormBtn,
      "new-task-ok": newTaskOkBtn,
      "new-task-cancel": newTaskCancelBtn,
      "task-done": taskDoneBtn,
      "task-delete": taskDeleteBtn,
      "task-schedule": taskScheduleBtn,
      "task-edit-title": taskEditTitleBtn,
      "ok-title-change": okTitleChangeBtn,
      "task-unfold-arrow": taskUnfoldArrow,
      "task-fold-arrow": taskFoldArrow,
      "task-edit-description": taskEditDescriptionBtn,
      "task-apply-description": taskApplyDescriptionBtn,
    };
    for (const className in classes) {
      if (e.target.classList.contains(className)) {
        classes[className](e);
        return;
      }
    }
  };
  body.addEventListener("click", click);
  body.querySelector("#set-hour").addEventListener("change", toggleHourWidget);
})();

class Todo {
  #priority = 1;
  constructor(title, nestedLvl) {
    this.title = title;
    this.description = "";
    this.dueDate = null;
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
  static setDate(id, date) {
    this.storage.todos[id].dueDate = new Date(date);
  }
  static setHour(id, hour) {
    let [hours, minutes] = hour.split(":");
    hours = +hours;
    minutes = +minutes;
    this.storage.todos[id].dueDate.setHours(hours, minutes);
  }
  static getDate(id) {
    return this.storage.todos[id].dueDate.toLocaleString();
  }
  static changeTitle(id, title) {
    this.storage.todos[id].title = title;
  }
  static getTitle(id) {
    return this.storage.todos[id].title;
  }
  static getDescription(id) {
    return this.storage.todos[id].description;
  }
  static setDescription(id, description) {
    this.storage.todos[id].description = description;
  }
  static getNestedLvl(id) {
    return this.storage.todos[id].nestedLvl;
  }
}
