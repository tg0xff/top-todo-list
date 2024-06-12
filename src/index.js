class Todo {
  #title;
  #description = "";
  #dueDate = "";
  #priority = 1;
  #done = false;
  constructor(title) {
    this.#title = title;
    this.nested = [];
  }
  setDescription(description) {
    this.description = description;
  }
  isProject() {
    return this.nested.length > 0;
  }
}
