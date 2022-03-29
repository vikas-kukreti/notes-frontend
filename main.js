const loginSection = document.querySelector("#login-form");
const signupSection = document.querySelector("#signup-form");
const navigateSignup = loginSection.querySelector("#navigate-signup");
const navigateLogin = signupSection.querySelector("#navigate-login");
const loginForm = loginSection.querySelector("form");;
const signupForm = signupSection.querySelector("form");
const loginError = loginForm.querySelector("#login-error");
const signupError = signupForm.querySelector("#signup-error");
const homeSection = document.querySelector("#home-section");
const logoutBtn = homeSection.querySelector("#logout-btn");
const listItems = homeSection.querySelector("#notes-list");
const content = homeSection.querySelector(".content");
const addBtn = homeSection.querySelector("#add-btn");
const newNoteModal = document.querySelector("#new-note-modal");
const profileModal = document.querySelector("#profile-modal");
const profileForm = profileModal.querySelector("#profile-form");
const cancelBtn = newNoteModal.querySelector("#cancel-btn");
const cancelProfile = profileModal.querySelector("#cancel-profile");
const newNoteForm = newNoteModal.querySelector("#new-note-form");
const userDetails = homeSection.querySelector(".user-details")

const loader = document.createElement("span")
loader.className = "loader";
loader.innerHTML = '<span class="box b1"></span><span class="box b2"></span><span class="box b3"></span><span class="box b4"></span>';

let user = {}
if (localStorage.getItem("is-logged-in") === "true") {
  user = JSON.parse(localStorage.getItem("user"))
  showHomeSection()
} else {
  loginSection.classList.add("show");
}

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const submitBtn = signupForm.querySelector("#signup-btn");
  submitBtn.innerHTML = "";
  submitBtn.appendChild(loader);
  submitBtn.disabled = true;
  const data = new FormData(signupForm);
  const body = {
    email: data.get("email"),
    name: data.get("name"),
    password: data.get("password"),
    c_password: data.get("c_password")
  }
  fetch("http://localhost:8080/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json"
    }
  }).then(res => res.json())
    .then(res => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Signup";
      if (!res.status) {
        signupError.classList.add("show");
        signupError.textContent = res.message;
      } else {
        localStorage.setItem("is-logged-in", "true");
        localStorage.setItem('user', JSON.stringify(res.user))
        user = res.user;
        showHomeSection()
      }
    })
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const submitBtn = loginForm.querySelector("#login-btn");
  submitBtn.innerHTML = "";
  submitBtn.appendChild(loader);
  submitBtn.disabled = true;
  const data = new FormData(loginForm);
  const body = {
    email: data.get("email"),
    password: data.get("password")
  }
  fetch("http://localhost:8080/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json"
    }
  }).then(res => res.json())
    .then(res => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Login";
      if (!res.status) {
        loginError.classList.add("show");
        loginError.textContent = res.message;
      } else {
        localStorage.setItem("is-logged-in", "true");
        localStorage.setItem('user', JSON.stringify(res.user))
        user = res.user;
        showHomeSection()
      }
    })
});

function renderProfile() {
  homeSection.querySelector('.user-header h2').textContent = user.name
  if(user.profile) {
    homeSection.querySelector(".user-profile").src = "http://localhost:8080/public/profile/" + user.profile
  } else {
    homeSection.querySelector(".user-profile").src = "assets/user.svg"
  }
}

function showHomeSection() {
  loginSection.classList.remove("show");
  signupSection.classList.remove("show");
  homeSection.classList.add("show");
  renderProfile()
  getNotes()
}

function getNotes(){
  document.body.appendChild(loader);
  fetch("http://localhost:8080/notes/?id=" + user.id)
  .then(res => res.json())
  .then(res => {
    document.body.removeChild(loader);
    listItems.innerHTML = ''
    content.innerHTML = ''
    res.notes.forEach(note => {
      const li = document.createElement('li')
      li.className = 'list-item'
      const listText = document.createElement('div')
      listText.className = 'list-text'
      const h4 = document.createElement('h4') 
      const p = document.createElement('p')
      h4.textContent = note.title
      p.textContent = note.date
      listText.appendChild(h4)
      listText.appendChild(p)
      li.appendChild(listText)
      
      const editButton = document.createElement('button')
      editButton.className = 'edit-btn'
      const editImage = document.createElement('img')
      editImage.src = 'assets/edit.svg'
      editImage.alt = 'edit icon'
      editButton.appendChild(editImage)
      li.appendChild(editButton)
      
      const deleteButton = document.createElement('button')
      deleteButton.className = 'delete-btn'
      const img = document.createElement('img')
      img.src = 'assets/trash-2.svg'
      img.alt = 'delete icon'
      deleteButton.appendChild(img)
      li.appendChild(deleteButton)
      
      li.addEventListener("click", () => {
        content.textContent = note.content;
      })
      
      editButton.addEventListener("click", () => {
        newNoteModal.querySelector("input").value = note.title;
        newNoteModal.querySelector("textarea").value = note.content;
        newNoteForm.querySelector("#note-id").value = note.id;
        newNoteModal.classList.add("show");
      })

      // get params = query params
      // url encoded
      deleteButton.addEventListener("click", () => {
        fetch("http://localhost:8080/notes?id=" + note.id, {
          method: "delete"
        })
        .then(res => res.json())
        .then(res => {
          if(res.status){
            getNotes();
          }
        })
      })

      listItems.appendChild(li)
    });
  })
}

navigateSignup.addEventListener("click", () => {
  loginSection.classList.remove("show");
  signupSection.classList.add("show");
});

navigateLogin.addEventListener("click", () => {
  signupSection.classList.remove("show");
  loginSection.classList.add("show");
});

logoutBtn.addEventListener("click", e => {
  localStorage.removeItem("user");
  localStorage.removeItem("is-logged-in");
  homeSection.classList.remove("show");
  loginSection.classList.add("show");
});

addBtn.addEventListener("click", e => {
  e.preventDefault();
  newNoteModal.classList.add("show");
});

userDetails.addEventListener("click", e => {
  e.preventDefault();
  profileForm.name.value = user.name
  profileForm.image.value = ""
  profileModal.classList.add("show");
});

cancelProfile.addEventListener("click", e => {
  profileModal.classList.remove("show");
})

cancelBtn.addEventListener("click", e => {
  e.preventDefault();
  newNoteModal.classList.remove("show");
  newNoteModal.querySelector("input").value = '';
  newNoteModal.querySelector("textarea").value = '';
  newNoteModal.querySelector("#note-id").value = '';
});

newNoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(newNoteForm);
  const title = formData.get("title");
  const content = formData.get("content");
  const noteId = formData.get("note_id");
  if(title === "") {
    alert("title cannot be blank");
  } else if(content === ""){
    alert("content cannot be blank");
  } else{
    newNoteForm.querySelector("button").disabled = true;
    newNoteForm.querySelector("button").textContent = "Adding...";
    fetch("http://localhost:8080/notes", {
      method: "post",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        content: content,
        id: user.id,
        noteId: noteId // empty
      })
    })
    .then(res => res.json())
    .then(res => {
      newNoteForm.querySelector("button").disabled = false;
      newNoteForm.querySelector("button").textContent = "Add Note";
      if(res.status){
        newNoteModal.classList.remove("show");
        newNoteForm.title.value = "";
        newNoteForm.content.value = "";
        newNoteForm.querySelector("#note-id").value = "";
        getNotes();
      } else {
        alert(res.message);
      }
    })
  }
})



profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const formData = new FormData(profileForm);
  formData.append('id', user.id)
  if(1 === 1) {
    profileForm.querySelector("button").disabled = true;
    profileForm.querySelector("button").textContent = "Updating...";
    fetch("http://localhost:8080/user/profile/", {
      method: "post",
      body: formData
    })
    .then(res => res.json())
    .then(res => {
      profileForm.querySelector("button").disabled = false;
      profileForm.querySelector("button").textContent = "Update Profile";
      if(res.status) {
        Object.assign(user, res.user)
        localStorage.setItem('user', JSON.stringify(user))
        renderProfile()
        profileModal.classList.remove("show")
      } else {
        alert(res.message)
      }
    })
  }
})
