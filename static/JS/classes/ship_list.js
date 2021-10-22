export default class ShipList {

    static selected_id = 0
    static ship_list = []
    static rotation = true
    static callback = () => {}
    static get ship_len() {
        return ShipList.ship_list[ShipList.selected_id]
    }

    constructor(statki, callback) {
        ShipList.callback = callback
        ShipList.ship_list = []
        for (let k = statki.length - 1; k >= 0; k--) {
            for (let j = 0; j < statki[k]; j++) {
                ShipList.ship_list.push(k + 1)
            }
        }
        ShipList.update()
    }

    static ship_pleaced() {
        ShipList.ship_list.splice(ShipList.selected_id, 1)
        ShipList.selected_id = -1
        ShipList.update()
        ShipList.callback()
    }

    static update() {
        let nav = document.querySelector("nav")
        nav.innerText = ''
        let t = this
        for (let i = 0; i < ShipList.ship_list.length; i++) {
            let element = document.createElement("DIV")
            element.classList.add("s-container")
            for (let k = 0; k < ShipList.ship_list[i]; k++) {
                let e = document.createElement("DIV")
                e.classList.add("element")
                if (i === ShipList.selected_id) {
                    e.classList.add("selected")
                }
                element.appendChild(e)
            }
            element.onmouseenter = function () {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].classList.add("hover");
                }
            }
            element.onmouseleave = function () {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].classList.remove("hover");
                }
            }
            element.onclick = function () {
                ShipList.selected_id = i
                t.update()
            }
            nav.appendChild(element)
        }
    }
}