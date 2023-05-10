import { GithubUser } from "./githubUser.js"



export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    
    this.load()
    this.emptyTable()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  emptyTable() {
    if(this.entries.length == 0) {
      this.removeAllTr()
      
      const emptyRow = document.createElement('tr')
      emptyRow.innerHTML = `
        <td class="no-user" colspan="4">
          <img src="../Assets/star.svg" alt="ícone de estrela" />
          <span>Nenhum favorito ainda</span>
        </td>
        <td></td>
        <td></td>
        <td></td>
        `
      if (!this.tbody) return
      this.tbody.append(emptyRow)
    }
  }

  async add(username) {

    try {
      const userExists = this.entries.find( entry => entry.login === username)
      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }
      
      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter( (entry) => entry.login !== user.login)

    this.entries = filteredEntries

    this.update()
    this.save()
  }
}



export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('#fav-btn')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('#username-text')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()
    this.emptyTable()

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('#remove-btn').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover essa linha?')
        if(isOk) {
          this.delete(user)
        }
        this.emptyTable()
      }
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
      <tr>
        <td class="user">
          <img src="https://github.com/Leodebat95.png" alt="Imagem de Leodebat95">
          <a href="https://github.com/Leodebat95" target="_blank">
            <p>Leonardo Debattisti</p>
            <span>Leodebat95</span>
          </a>
        </td>

        <td class="repositories">
          458
        </td>

        <td class="followers">
          795
        </td>

        <td>
          <button id="remove-btn">Remover</button>
        </td>
      </tr>
      `
    
    return tr
  }

  removeAllTr() {
    
    if (!this.tbody) return

    this.tbody.querySelectorAll('tr')
    .forEach( (tr) => {
      tr.remove()
    })
  }
}
