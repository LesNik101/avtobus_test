let mode = "group"

document.getElementById("add_contact_action_button").onclick = function () {
  mode = "contacts"
  document.getElementById("add_new_group").classList.add("hidden")
  const groups = getGroups()
  if (groups.length) {
    openSidebar()
    drawContactForm(groups)
  }
}

function createInputElement({ placeholder = "", value = "", id = "" } = {}) {
  const inputElement = document.createElement("input")
  if (id) {
    inputElement.setAttribute("id", id)
  }
  inputElement.classList.add("form-control")
  inputElement.setAttribute("placeholder", placeholder)
  inputElement.setAttribute("value", value)
  return inputElement
}

function createGroupSelect() {
  //
}

function drawContactForm(groups, contact) {
  clearSidebar()
  const sidebar_content = document.getElementById("sidebar_content")
  const inputName = createInputElement({
    placeholder: "Введите ФИО",
    id: "input_name",
    value: contact ? contact.name : "",
  })
  sidebar_content.appendChild(inputName)
  const inputPhone = createInputElement({
    placeholder: "Введите номер",
    id: "input_phone",
    value: contact ? contact.phone : "",
  })
  sidebar_content.appendChild(inputPhone)

  const defaultOption = document.createElement("option")
  defaultOption.setAttribute("selected", "")
  defaultOption.setAttribute("disabled", "")
  defaultOption.innerText = "Выберите группу"
  const groupSelect = document.createElement("select")
  groupSelect.classList.add("form-select")
  groupSelect.setAttribute("placeholder", "выберите группу")
  groupSelect.appendChild(defaultOption)
  for (let group of groups) {
    const option = document.createElement("option")
    option.setAttribute("value", group)
    option.innerText = group
    groupSelect.appendChild(option)
  }
  groupSelect.setAttribute("id", "group_select")
  sidebar_content.appendChild(groupSelect)
}

document.getElementById("add_group_action_button").onclick = function () {
  mode = "group"
  document.getElementById("add_new_group").classList.remove("hidden")
  openSidebar()
  const groups = getGroups()
  if (groups.length) {
    drawGroups(groups)
  }
}

function openSidebar() {
  const element = document.getElementById("add_container")
  element.classList.remove("hidden")
}

function getGroups() {
  return JSON.parse(localStorage.getItem("groups"))
}

function closeSidebar() {
  const element = document.getElementById("add_container")
  element.classList.add("hidden")
}

function clearSidebar() {
  const sidebar_content = document.getElementById("sidebar_content")
  while (sidebar_content.lastElementChild) {
    sidebar_content.removeChild(sidebar_content.lastElementChild)
  }
}

function drawGroups(groups) {
  const sidebar_content = document.getElementById("sidebar_content")
  clearSidebar()
  for (let group of groups) {
    const input = createInputElement({
      placeholder: "Введите название",
      value: group,
    })

    const img = document.createElement("img")
    img.setAttribute("src", "img/svg/Delete.svg")

    const button = document.createElement("button")
    button.classList.add("btn", "btn-outline-danger", "btn-icon")
    button.setAttribute(
      "onmouseover",
      "setSrc(this, 'img/svg/DeleteWhite.svg');"
    )
    button.setAttribute("onmouseout", "setSrc(this, 'img/svg/Delete.svg');")
    button.appendChild(img)
    button.onclick = function (event) {
      const value =
        event.currentTarget.parentNode.getElementsByTagName("input")[0].value
      removeGroup(value)
      document
        .getElementById("sidebar_content")
        .removeChild(event.currentTarget.parentNode)
    }

    const groupItem = document.createElement("div")
    groupItem.classList.add("group-item")
    groupItem.appendChild(input)
    groupItem.appendChild(button)
    sidebar_content.appendChild(groupItem)
  }
}

document.getElementById("add_container_close").onclick = function () {
  closeSidebar()
}

document.getElementById("add_new_group").onclick = function () {
  const input = document.createElement("input")
  input.classList.add("form-control")
  input.setAttribute("placeholder", "Введите название") //

  const img = document.createElement("img")
  img.setAttribute("src", "img/svg/Delete.svg")
  const button = document.createElement("button")
  button.classList.add("btn", "btn-outline-danger", "btn-icon")
  button.setAttribute("onmouseover", "setSrc(this, 'img/svg/DeleteWhite.svg');") //
  button.setAttribute("onmouseout", "setSrc(this, 'img/svg/Delete.svg');")
  button.appendChild(img)

  const groupItem = document.createElement("div")
  groupItem.classList.add("group-item")
  groupItem.appendChild(input)
  groupItem.appendChild(button)
  document.getElementById("sidebar_content").appendChild(groupItem)
}

function setSrc(element, path) {
  const img = element.getElementsByTagName("img")[0]
  img.setAttribute("src", path)
}

document.getElementById("save_sidebar_action_button").onclick = function () {
  console.log("save")
  if (mode === "group") {
    saveGroups()
  }
  if (mode === "contacts") {
    saveContact()
  }
}

function saveGroups() {
  localStorage.removeItem("groups")
  const inputs = document.getElementsByTagName("input")
  const groups = Array.from(inputs)
    .map(({ value }) => value)
    .filter((value) => value)
  localStorage.setItem("groups", JSON.stringify(groups))
  closeSidebar()
}

function searchGroup(element) {}
function removeGroup(value) {
  let groups = JSON.parse(localStorage.getItem("groups"))
  groups = groups.filter((x) => x !== value)
  ////todo remove contacts
  localStorage.removeItem("groups")
  localStorage.setItem("groups", JSON.stringify(groups))
}

function saveContact() {
  const name = document.getElementById("input_name").value
  const phone = document.getElementById("input_phone").value
  const group = document.getElementById("group_select").value
  let contacts = getContacts()
  if (contacts) {
    if (contacts[group]) {
      contacts[group].push({ name, phone, group })
    } else {
      contacts[group] = [{ name, phone, group }]
    }
  } else {
    contacts = {}
    contacts[group] = [{ name, phone, group }]
  }
  setContacts(contacts)
}

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts"))
}
function setContacts(contacts) {
  localStorage.setItem("contacts", JSON.stringify(contacts))
  updateContactList()
}
function updateContactList() {
  const contacts = getContacts()
  if (Object.keys(contacts).length) {
    document.getElementById("empty_list").classList.add("hidden")
    drawContactList(contacts)
  }
}

updateContactList()

function drawContactList(contacts) {
  const contentContainer = document.getElementById("content")
  for (let groupName of Object.keys(contacts)) {
    const currentIndex = Object.keys(contacts).indexOf(groupName)

    const contactContainer = document.createElement("ul")
    contactContainer.classList.add("list-group", "list-group-flush")
    contacts[groupName].forEach((contact) => {
      const listItem = document.createElement("li")
      listItem.classList.add("list-group-item")
      listItem.innerText = contact.name
      contactContainer.appendChild(listItem)
    })

    const accordionBody = document.createElement("div")
    accordionBody.classList.add("accordion-body")
    accordionBody.appendChild(contactContainer)

    const collapse = document.createElement("div")
    collapse.setAttribute("id", `collapse${currentIndex}`)
    collapse.classList.add("accordion-collapse", "collapse")
    collapse.setAttribute("aria-labelledby", `heading${currentIndex}`)
    collapse.setAttribute("data-bs-parent", `groupe${currentIndex}`)
    collapse.appendChild(accordionBody)

    const button = document.createElement("button")
    button.classList.add("accordion-button", "collapsed")
    button.setAttribute("type", "button")
    button.setAttribute("data-bs-toggle", "collapse")
    button.setAttribute("data-bs-target", `#collapse${currentIndex}`)
    button.setAttribute("aria-expanded", "false")
    button.setAttribute("aria-controls", `collapse${currentIndex}`)
    button.innerText = groupName

    const header = document.createElement("h2")
    header.setAttribute("id", `header${currentIndex}`)
    header.classList.add("accordion-header")
    header.appendChild(button)

    const accordionItem = document.createElement("div")
    accordionItem.classList.add("accordion-item")
    accordionItem.appendChild(header)
    accordionItem.append(collapse)

    const accordion = document.createElement("div")
    accordion.classList.add("accordion")
    accordion.setAttribute("id", `groupe${currentIndex}`)
    accordion.appendChild(accordionItem)
    contentContainer.appendChild(accordion)
  }
}
