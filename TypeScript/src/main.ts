class User {
  public id: number;
  protected name: string;
  protected email: string;
  private password: string;
  protected phone: string;
  private _age: number;
  private notebooks: NoteBook[] = [];

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this._age = 0;
    this.age = age;
  }

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    if (value < 18 || value > 60) {
      throw new Error(`Age must be between 18 and 60. Received: ${value}`);
    }
    this._age = value;
  }

  addNotebook(notebook: NoteBook): void {
    this.notebooks.push(notebook);
    console.log(`NoteBook "${notebook.title}" added to user "${this.name}".`);
  }

  removeNotebook(title: string): void {
    const index = this.notebooks.findIndex((nb) => nb.title === title);
    if (index === -1) {
      console.log(`NoteBook "${title}" not found.`);
    } else {
      this.notebooks.splice(index, 1);
      console.log(`NoteBook "${title}" removed from user "${this.name}".`)
    }
  }

  getNotebooks(): NoteBook[] {
    return this.notebooks;
  }

  displayInfo(): void {
    console.log(`User Info:`);
    console.log(`ID: ${this.id}`);
    console.log(`Name: ${this.name}`);
    console.log(`Email: ${this.email}`);
    console.log(`Phone: ${this.phone}`);
    console.log(`Age: ${this._age}`);
  }
}


class Admin extends User {
  private adminLevel: number;

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number,
    adminLevel: number = 1
  ) {
    super(id, name, email, password, phone, age);
    this.adminLevel = adminLevel;
  }

  // Admin can manage notes inside any notebook
  manageNotes(notebook: NoteBook): void {
    console.log(`\n[Admin: ${this.name}] Managing NoteBook "${notebook.title}":`);
    const notes = notebook.getAllNotes();
    if (notes.length === 0) {
      console.log("No notes found.");
    } else {
      notes.forEach((note, i) => {
        console.log(`${i + 1}. [ID:${note.id}] ${note.title} — ${note.preview()}`);
      });
    }
  }

  displayInfo(): void {
    super.displayInfo();
    console.log(`Role: Admin (Level ${this.adminLevel})`);
  }
}

class Note {
  public id: number;
  public title: string;
  public content: string;
  public author: User; 

  constructor(id: number, title: string, content: string, author: User) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
  }

  preview(): string {
    return this.content.length > 60
      ? this.content.substring(0, 60) + "..."
      : this.content;
  }
}



class NoteBook {
  public title: string;
  private notes: Note[] = [];

  constructor(title: string) {
    this.title = title;
  }

  addNote(note: Note): void {
    this.notes.push(note);
    console.log(`Note "${note.title}" added to NoteBook "${this.title}".`);
  }

  removeNote(noteId: number): void {
    const index = this.notes.findIndex((n) => n.id === noteId);
    if (index === -1) {
      console.log(`Note with ID ${noteId} not found.`);
    } else {
      const removed = this.notes.splice(index, 1)[0];
      if (!removed) {
        console.log(`Note with ID ${noteId} could not be removed.`);
        return;
      }
      console.log(
        `Note "${removed.title}" removed from NoteBook "${this.title}".`
      );
    }
  }

  getAllNotes(): Note[] {
    return this.notes;
  }
}

class Storage<T> {
  private items: T[] = [];

  addItem(item: T): void {
    this.items.push(item);
  }

  removeItem(predicate: (item: T) => boolean): void {
    const index = this.items.findIndex(predicate);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  getAllItems(): T[] {
    return [...this.items];
  }
}
