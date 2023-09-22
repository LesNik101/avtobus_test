let mode = "group"
let contactID = ""

document.getElementById("add_contact_action_button").onclick = function () {
  mode = "contacts"
  contactID = ""
  document.getElementById("add_new_group").classList.add("hidden")
  const groups = getContacts()
  if (Object.keys(groups).length) {
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

function drawContactForm(groups, contact, groupID) {
  clearSidebar()
  const sidebar_content = document.getElementById("sidebar_content")
  const inputName = createInputElement({
    placeholder: "Введите ФИО",
    id: "input_name",
    value: contact ? contact.name : "",
  })
  const maskOptionsName = {
    mask: /^[a-zA-ZА-Яа-я][a-za-zA-ZА-Яа-я\s]*$/,
  }
  new IMask(inputName, maskOptionsName)
  sidebar_content.appendChild(inputName)
  const inputPhone = createInputElement({
    placeholder: "Введите номер",
    id: "input_phone",
    value: contact ? contact.phone : "",
  })
  const maskOptionsPhone = {
    mask: "+{7}(000)000-00-00",
  }
  new IMask(inputPhone, maskOptionsPhone)

  sidebar_content.appendChild(inputPhone)

  const defaultOption = document.createElement("option")
  defaultOption.setAttribute("selected", "")
  defaultOption.setAttribute("disabled", "")
  defaultOption.setAttribute("value", "")
  defaultOption.innerText = "Выберите группу"
  const groupSelect = document.createElement("select")
  groupSelect.classList.add("form-select")
  groupSelect.setAttribute("placeholder", "выберите группу")
  groupSelect.appendChild(defaultOption)
  for (let groupId in groups) {
    const option = document.createElement("option")
    option.setAttribute("value", groupId)
    option.innerText = groups[groupId].name
    groupSelect.appendChild(option)
  }

  groupSelect.value = groupID ? groupID : ""
  groupSelect.setAttribute("id", "group_select")
  sidebar_content.appendChild(groupSelect)
}

document.getElementById("add_group_action_button").onclick = function () {
  mode = "group"
  document.getElementById("add_new_group").classList.remove("hidden")
  openSidebar()
  const contacts = getContacts()
  if (contacts && Object.keys(contacts).length) {
    drawGroups(contacts)
  }
}

function openSidebar() {
  const element = document.getElementById("add_container")
  element.classList.remove("hidden")
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
  clearSidebar()
  for (let groupId in groups) {
    createGroupItem({ id: groupId, name: groups[groupId].name })
  }
}

document.getElementById("add_container_close").onclick = function () {
  closeSidebar()
}

document.getElementById("add_new_group").onclick = function () {
  createGroupItem()
}

function createGroupItem({ id = crypto.randomUUID(), name = "" } = {}) {
  const input = createInputElement({
    placeholder: "Введите название",
    value: name,
  })

  const img = document.createElement("img")
  img.setAttribute("src", "img/svg/Delete.svg")
  const button = document.createElement("button")
  button.classList.add("btn", "btn-outline-danger", "btn-icon")
  button.setAttribute("onmouseover", "setSrc(this, 'img/svg/DeleteWhite.svg');")
  button.setAttribute("onmouseout", "setSrc(this, 'img/svg/Delete.svg');")
  button.onclick = (function (id) {
    return function () {
      removeGroup(id)
      const currentGroupItem = document.getElementById(id)
      document.getElementById("sidebar_content").removeChild(currentGroupItem)
    }
  })(id)
  button.appendChild(img)

  const groupItem = document.createElement("div")
  groupItem.classList.add("group-item")
  groupItem.setAttribute("id", id)
  groupItem.appendChild(input)
  groupItem.appendChild(button)
  document.getElementById("sidebar_content").appendChild(groupItem)
}

function setSrc(element, path) {
  const img = element.getElementsByTagName("img")[0]
  img.setAttribute("src", path)
}

document.getElementById("save_sidebar_action_button").onclick = function () {
  if (mode === "group") {
    saveGroups()
  }
  if (mode === "contacts") {
    saveContact()
  }
}

function saveGroups() {
  const itemGroupList = document.getElementsByClassName("group-item")
  const groupsForSave = Array.from(itemGroupList)
    .map((groupItem) => {
      return {
        id: groupItem.id,
        name: groupItem.getElementsByTagName("input")[0].value,
      }
    })
    .filter(({ name }) => name)
  const oldContacts = getContacts()
  const newContacts = {}
  groupsForSave.forEach((group) => {
    newContacts[group.id] = {
      name: group.name,
      contacts:
        oldContacts && oldContacts[group.id]?.contacts
          ? oldContacts[group.id]?.contacts
          : [],
    }
  })
  setContacts(newContacts)
  closeSidebar()
}

function removeGroup(groupId) {
  let groups = getContacts()
  delete groups[groupId]
  setContacts(groups)
}

function removeContact(groupID, contactID) {
  const contacts = getContacts()
  contacts[groupID].contacts = contacts[groupID].contacts.filter(
    ({ id }) => id !== contactID
  )
  setContacts(contacts)
}

function saveContact() {
  const name = document.getElementById("input_name").value
  const phone = document.getElementById("input_phone").value
  const group = document.getElementById("group_select").value
  if (!name || !phone || phone.length !== 16 || !group) {
    return
  }
  let contacts = getContacts()
  if (contactID === "") {
    ///new contact
    contacts[group].contacts.push({ id: crypto.randomUUID(), name, phone })
  } else {
    const oldContact = contacts[group].contacts.find(
      ({ id }) => id === contactID
    )
    if (oldContact) {
      ////contact in old group
      ;[oldContact.name, oldContact.phone] = [name, phone]
    } else {
      ///contact switched group
      for (let groupID in contacts) {
        contacts[groupID].contacts = contacts[groupID].contacts.filter(
          ({ id }) => id !== contactID
        )
      }
      contacts[group].contacts.push({
        id: contactID,
        name,
        phone,
      })
    }
  }

  setContacts(contacts)
  closeSidebar()
}

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts"))
}
function setContacts(contacts) {
  localStorage.clear("contacts")
  localStorage.setItem("contacts", JSON.stringify(contacts))
  updateContactList()
}
function updateContactList() {
  const contacts = getContacts()
  if (contacts && Object.keys(contacts).length) {
    document.getElementById("empty_list").classList.add("hidden")
    drawContactList(contacts)
  }
}

updateContactList()

function drawContactList(contacts) {
  const contentContainer = document.getElementById("content")
  contentContainer.innerHTML = ""
  for (let groupId in contacts) {
    const currentIndex = Object.keys(contacts).indexOf(groupId)

    const contactContainer = document.createElement("ul")
    contactContainer.classList.add("list-group", "list-group-flush")
    contacts[groupId].contacts.forEach((contact) => {
      const listItem = document.createElement("li")
      listItem.classList.add("list-group-item")
      const nameSpan = document.createElement("span")
      nameSpan.classList.add("contact-name")
      nameSpan.innerText = contact.name
      listItem.appendChild(nameSpan)
      const actionAndPhoneBlock = document.createElement("div")
      actionAndPhoneBlock.classList.add("action-and-phone")
      const phoneSpan = document.createElement("span")
      phoneSpan.innerText = contact.phone
      actionAndPhoneBlock.appendChild(phoneSpan)
      const actionBlock = document.createElement("div")
      actionBlock.classList.add("action-block")

      const editImg = document.createElement("img")
      editImg.setAttribute("src", "img/svg/Edit.svg")
      const editButton = document.createElement("button")
      editButton.classList.add("btn", "btn-outline-primary", "btn-icon")
      editButton.setAttribute(
        "onmouseover",
        "setSrc(this, 'img/svg/EditWhite.svg');"
      )
      editButton.setAttribute("onmouseout", "setSrc(this, 'img/svg/Edit.svg');")
      editButton.onclick = (function (contact, groupId) {
        return function () {
          mode = "contacts"
          contactID = contact.id
          document.getElementById("add_new_group").classList.add("hidden")
          openSidebar()
          drawContactForm(getContacts(), contact, groupId)
        }
      })(contact, groupId)
      editButton.appendChild(editImg)

      const deleteImg = document.createElement("img")
      deleteImg.setAttribute("src", "img/svg/Delete.svg")
      const deleteButton = document.createElement("button")
      deleteButton.classList.add("btn", "btn-outline-danger", "btn-icon")
      deleteButton.setAttribute(
        "onmouseover",
        "setSrc(this, 'img/svg/DeleteWhite.svg');"
      )
      deleteButton.setAttribute(
        "onmouseout",
        "setSrc(this, 'img/svg/Delete.svg');"
      )
      deleteButton.onclick = (function (groupID, contactID) {
        return function () {
          removeContact(groupID, contactID)
        }
      })(groupId, contact.id)
      deleteButton.appendChild(deleteImg)

      actionBlock.appendChild(editButton)
      actionBlock.appendChild(deleteButton)
      actionAndPhoneBlock.appendChild(actionBlock)

      listItem.appendChild(actionAndPhoneBlock)
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
    button.innerText = contacts[groupId].name

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
