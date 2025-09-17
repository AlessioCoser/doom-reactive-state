import {Accessor, Div, For, Input, Li, signal, Ul} from "doom-reactive-state"

type Item = { id: number, text: string, done: boolean }

function newItem(text: string, identifier: number | null = null, done: boolean = false): Item {
    const id = identifier || (new Date()).getTime();
    return {id, text, done};
}

type ItemCallback = (id: Item['id']) => void
type TodoItemProps = { item: Accessor<Item>, onclick: ItemCallback, onclose: ItemCallback }
const TodoItem = ({item, onclick, onclose}: TodoItemProps) => {
    return Li({
        key: item().id,
        className: () => item().done ? "done" : "",
        onclick: () => onclick(item().id)
    }, [
        Div(() => item().text),
        Div({className: "delete", onclick: () => onclose(item().id)}, 'ⓧ')
    ]);
}

type TodoListProps = { items: Accessor<Item[]>, onItemClick: ItemCallback, onItemClose: ItemCallback }
const TodoList = ({items, onItemClick, onItemClose}: TodoListProps) => {
    return Ul(For({
            items: items,
            each: (item) => TodoItem({
                item,
                onclick: onItemClick,
                onclose: onItemClose
            })
        })
    )
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
            if (item.id === id) {
                return {...item, done: !item.done}
            }
            return item
        }))
    }

    const onkeyup = function (this: HTMLInputElement, e: KeyboardEvent) {
        if (e.key === "Enter" && this.value.trim() !== "") {
            setItems([newItem(this.value.trim()), ...items()])
            this.value = ""
        }
    }

    return Div([
        Input({type: 'text', onkeyup, placeholder: "Press enter to create"}),
        TodoList({items, onItemClick, onItemClose})
    ])
}

document.body.appendChild(App())
