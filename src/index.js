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
  mdiPlusCircleMultiple,
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
    const taskIndentVar = getComputedStyle(document.body).getPropertyValue(
      "--task-indentation",
    );
    const indentMargin = Number(taskIndentVar.slice(0, -2)) * indentMultiplier;
    return `${indentMargin}px`;
  };
  const addDescriptionElements = (task) => {
    const taskId = task.getAttribute("data-id");
    const contents = task.querySelector(".task-contents");
    const nested = contents.querySelector(".nested");
    const description = document.createElement("div");
    description.className = "task-description";
    description.innerHTML = Storage.getDescription(taskId).replaceAll(
      "\n",
      "<br>",
    );
    contents.insertBefore(description, nested);
    const descButtons = document.createElement("div");
    descButtons.className = "task-description-buttons";
    contents.insertBefore(descButtons, nested);
    const editDescriptionBtn = makeButton(
      "task-edit-description",
      mdiPencil,
      24,
    );
    descButtons.appendChild(editDescriptionBtn);
  };
  const makeTaskHeader = (id) => {
    const taskHeader = document.createElement("span");
    taskHeader.className = "task-header";
    const foldArrow = makeFoldIcon(false);
    taskHeader.appendChild(foldArrow);
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = Storage.getTitle(id);
    taskHeader.appendChild(title);
    const scheduled = document.createElement("span");
    scheduled.className = "scheduled";
    scheduled.textContent = Storage.getDate(id) ?? "";
    taskHeader.appendChild(scheduled);
    const taskButtons = createTaskButtons();
    taskHeader.appendChild(taskButtons);
    return taskHeader;
  };
  const makeTaskDiv = (id) => {
    const task = document.createElement("div");
    task.className = "task";
    task.setAttribute("data-id", id);
    const taskHeader = makeTaskHeader(id);
    task.appendChild(taskHeader);
    return task;
  };
  const showNestedTasks = (container, ids) => {
    for (const id of ids) {
      const task = makeTaskDiv(id);
      container.appendChild(task);
    }
  };
  const makeNewTaskForm = (container) => {
    const task = document.createElement("div");
    task.classList.add("task");
    container.appendChild(task);
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
  const newTaskFormBtn = () => {
    const container = body.querySelector("#tasks");
    makeNewTaskForm(container);
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
    const task = findParentElement(e, "task");
    const form = task.querySelector(".new-task-form");

    const parentTask = task.parentNode.parentNode.parentNode;
    const parentTaskId = parentTask.getAttribute("data-id");
    let nestedLvl;
    if (parentTask.classList.contains("task")) {
      nestedLvl = Storage.getNestedLvl(parentTaskId) + 1;
    } else {
      nestedLvl = 0;
    }

    const titleInput = form.querySelector("input");
    const taskId = Storage.newTodo(titleInput.value, nestedLvl);
    task.setAttribute("data-id", taskId);
    if (nestedLvl > 0) {
      Storage.pushNested(parentTaskId, taskId);
    }
    form.remove();
    const taskHeader = makeTaskHeader(taskId);
    task.appendChild(taskHeader);
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

    const parentTask = task.parentNode.parentNode.parentNode;
    const parentTaskId = parentTask.getAttribute("data-id");
    if (parentTask.classList.contains("task")) {
      Storage.deleteNested(parentTaskId, taskId);
    }

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
    const taskId = taskHeader.parentNode.getAttribute("data-id");
    const title = taskHeader.querySelector(".task-title");
    if (!title) {
      return;
    }
    title.remove();
    const scheduled = taskHeader.querySelector(".scheduled");
    const textWidget = document.createElement("input");
    textWidget.type = "text";
    textWidget.value = Storage.getTitle(taskId);
    taskHeader.insertBefore(textWidget, scheduled);
    const applyTitleBtn = makeButton("ok-title-change", mdiCheck, 24);
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
    nested.className = "nested";
    showNestedTasks(nested, Storage.getNestedArr(taskId));
    contents.appendChild(nested);
    addDescriptionElements(task);
    const addNestedTask = makeButton(
      "add-nested-task",
      mdiPlusCircleMultiple,
      24,
    );
    contents.appendChild(addNestedTask);
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
    const taskId = task.getAttribute("data-id");
    const contents = task.querySelector(".task-contents");
    const nested = contents.querySelector(".nested");
    contents.querySelector(".task-description").remove();
    contents.querySelector(".task-description-buttons").remove();
    const textarea = document.createElement("textarea");
    textarea.className = "task-description";
    textarea.textContent = Storage.getDescription(taskId);
    contents.insertBefore(textarea, nested);
    const descButtons = document.createElement("div");
    descButtons.className = "task-description-buttons";
    contents.insertBefore(descButtons, nested);
    const applyDescriptionBtn = makeButton(
      "task-apply-description",
      mdiCheck,
      24,
    );
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
  const addNestedTaskBtn = (e) => {
    const task = findParentElement(e, "task");
    const nestedContainer = task.querySelector(".nested");
    makeNewTaskForm(nestedContainer);
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
      "add-nested-task": addNestedTaskBtn,
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
  const newTaskBtn = makeButton("new-task", mdiPlusCircle, 24);
  body.appendChild(newTaskBtn);
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
    if (this.storage.todos[id].nestedLvl === 0) {
      const index = this.storage.topLvl.indexOf(id);
      this.storage.topLvl.splice(index, 1);
    }
    this.storage.todos[id] = null;
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
    const date = this.storage.todos[id].dueDate;
    if (date) return date.toLocaleString();
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
  static getNestedArr(id) {
    return this.storage.todos[id].nested;
  }
  static pushNested(parentId, childId) {
    this.storage.todos[parentId].nested.push(childId);
  }
  static deleteNested(parentId, childId) {
    const index = this.storage.todos[parentId].nested.indexOf(childId);
    this.storage.todos[parentId].nested.splice(index, 1);
  }
}
