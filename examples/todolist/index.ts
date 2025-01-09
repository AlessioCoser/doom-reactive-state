import { Div, Input, Li, signal, Ul } from "doom-reactive-state"
import type { Accessor, Component } from "doom-reactive-state"

type Item = { id: number, text: string, done: boolean }
function newItem(text: string, identifier: number | null = null, done: boolean = false): Item {
  const id = identifier || (new Date()).getTime();
  return { id, text, done };
}

type ItemCallback = (id: Item['id']) => void
type TodoItemProps = { item: Item, onclick: ItemCallback, onclose: ItemCallback }
const TodoItem: Component<TodoItemProps> = ({ item, onclick, onclose }) => {
  const doneClass = () => item.done ? "done" : ""

  return Li({ className: doneClass, onclick: () => onclick(item.id) }, [
    Div(() => item.text),
    Div({ className: "delete", onclick: () => onclose(item.id) }, 'ⓧ')
  ]);
}

type TodoListProps = { items: Accessor<Item[]>, onItemClick: ItemCallback, onItemClose: ItemCallback }
const TodoList: Component<TodoListProps> = ({ items, onItemClick, onItemClose }) => {
  return Ul(() => items().map((item: Item) =>
    TodoItem({ item, onclick: onItemClick, onclose: onItemClose })
  ))
}

const App = () => {
  const [items, setItems] = signal<Item[]>([
    newItem("first", 1),
    newItem("completed", 2, true),
    newItem("second", 3)
  ]);

  const onItemClose: ItemCallback = (id) => {
    setItems(items().filter(item => item.id !== id))
  }

  const onItemClick: ItemCallback = (id) => {
    setItems(items().map(item => {
      if(item.id === id) {
        return { ...item, done: !item.done }
      }
      return item
    }))
  }

  const onkeyup = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      setItems([newItem(e.target.value.trim()), ...items()])
      e.target.value = ""
    }
  }

  return Div([
    Input({ type: 'text', onkeyup, placeholder: "Press enter to create" }),
    TodoList({ items, onItemClick, onItemClose })
  ])
}

document.body.appendChild(App())
