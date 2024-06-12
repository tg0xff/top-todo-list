class Todo {
  constructor(title) {
    this.title = title;
    this.description = "";
    this.dueDate = "";
    this.priority = 1;
    this.done = false;
    this.nested = [];
  }
  setDescription(description) {
    this.description = description;
  }
  isProject() {
    return this.nested.length > 0;
  }
}
