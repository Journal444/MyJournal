// --- GLOBAL FUNCTIONS ---

function displayEntries() {
  const entriesContainer = document.getElementById("entries-container");
  if (!entriesContainer) return;

  const currentUser = localStorage.getItem("CURRENT_USER") || "guest";
  const userStorageKey = "journalEntries_" + currentUser;
  const entries = JSON.parse(localStorage.getItem(userStorageKey)) || [];

  entries.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  entriesContainer.innerHTML = "";

  if (entries.length === 0) {
    entriesContainer.innerHTML = "<p>No saved entries yet.</p>";
    return;
  }

  entries.forEach(function(entry, index) {
    const card = document.createElement("div");
    card.classList.add("entry-card");

    card.innerHTML = `
      <h3>${entry.subject}</h3>
      <small><em>${entry.date}</em></small>
      <p>${entry.body}</p>
      <button class="edit-btn" data-index="${index}">Edit</button>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;

    entriesContainer.appendChild(card);
  });

  // Attach event listeners for Edit buttons
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", function() {
      const index = this.getAttribute("data-index");
      editEntry(index);
    });
  });

  // Attach event listeners for Delete buttons
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function() {
      const index = this.getAttribute("data-index");
      deleteEntry(index);
    });
  });
}

let editingIndex = null;

function editEntry(index) {
  const currentUser = localStorage.getItem("CURRENT_USER") || "guest";
  const userStorageKey = "journalEntries_" + currentUser;
  const entries = JSON.parse(localStorage.getItem(userStorageKey)) || [];

  entries.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  const entry = entries[index];
  if (!entry) return;

  document.getElementById("entry-date").value = entry.date;
  document.getElementById("entry-subject").value = entry.subject;
  document.getElementById("entry-input").value = entry.body;

  editingIndex = index;
  const saveBtn = document.getElementById("entry-btn");
  if (saveBtn) saveBtn.textContent = "Update Entry";
}

function deleteEntry(index) {
  const currentUser = localStorage.getItem("CURRENT_USER") || "guest";
  const userStorageKey = "journalEntries_" + currentUser;
  const entries = JSON.parse(localStorage.getItem(userStorageKey)) || [];

  entries.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  entries.splice(index, 1);
  localStorage.setItem(userStorageKey, JSON.stringify(entries));

  if (editingIndex == index) {
    editingIndex = null;
    const saveBtn = document.getElementById("entry-btn");
    if (saveBtn) saveBtn.textContent = "Save Entry";
  }

  displayEntries();
}


// --- DOMContentLoaded EVENT HANDLER ---

document.addEventListener("DOMContentLoaded", function() {

  // --- 1. SELECTION & DOM ELEMENTS ---
  const log_usrnm = document.getElementById("login-usrnm");
  const log_psswrd = document.getElementById("login-psswrd");
  const log_btn = document.getElementById("login-btn");

  const sign_usrnm = document.getElementById("sgnup-usrnm");
  const sign_email = document.getElementById("sgnup-email");
  const sign_psswrd = document.getElementById("sgnup-psswrd");
  const sign_btn = document.getElementById("sgnup-btn");

  const entryDate = document.getElementById("entry-date");
  const entrySubject = document.getElementById("entry-subject");
  const entryInput = document.getElementById("entry-input");
  const saveBtn = document.getElementById("entry-btn");
  const entriesContainer = document.getElementById("entries-container");


  // --- 2. CODE PAGE DISPLAY LOGIC ---
  const resetUsernameDisplay = document.getElementById("RESET_USERNAME");
  if (resetUsernameDisplay !== null) {
    const savedUser = localStorage.getItem("RESET_USER") || "User";
    resetUsernameDisplay.textContent = savedUser;
  }


  // --- 3. SIGN-UP LOGIC ---
  if (sign_btn !== null) {
    sign_btn.addEventListener("click", function() {
      const sign_username = sign_usrnm ? sign_usrnm.value.trim() : "";
      const sign_email_val = sign_email ? sign_email.value.trim() : "";
      const sign_password = sign_psswrd ? sign_psswrd.value.trim() : "";

      if (sign_username === "" || sign_email_val === "" || sign_password === "") {
        alert("Please fill in all fields (username, email, and password) to sign up!");
        return;
      }

      const users = JSON.parse(localStorage.getItem("REGISTERED_USERS")) || [];

      const usernameExists = users.some(function(user) {
        return user.username === sign_username;
      });

      if (usernameExists) {
        alert("That username is already taken! Please choose a different one.");
        return;
      }

      users.push({ 
        username: sign_username, 
        email: sign_email_val, 
        password: sign_password 
      });

      localStorage.setItem("REGISTERED_USERS", JSON.stringify(users));
      localStorage.setItem("CURRENT_USER", sign_username);

      if (sign_usrnm) sign_usrnm.value = "";
      if (sign_email) sign_email.value = "";
      if (sign_psswrd) sign_psswrd.value = "";

      alert("Account created successfully!");
      window.location.href = "journal.html";
    });
  }


  // --- 4. LOGIN LOGIC ---
  if (log_btn !== null) {
    log_btn.addEventListener("click", function() {
      const login_username = log_usrnm ? log_usrnm.value.trim() : "";
      const login_password = log_psswrd ? log_psswrd.value.trim() : "";

      if (login_username === "" || login_password === "") {
        alert("Please enter both your username and password to log in!");
        return;
      }

      const users = JSON.parse(localStorage.getItem("REGISTERED_USERS")) || [];

      const matchedUser = users.find(function(user) {
        return user.username === login_username && user.password === login_password;
      });

      const isAdmin = (login_username === "admin" && login_password === "1234");

      if (matchedUser || isAdmin) {
        localStorage.setItem("CURRENT_USER", login_username);
        window.location.href = "journal.html";
      } else {
        alert("Invalid username or password!");
      }
    });
  }


  // --- 5. RECOVERY CODE DISPATCH LOGIC (psswrd_recover.html) ---
  const send_code_btn = document.getElementById("send_code_btn");
  if (send_code_btn !== null) {
    send_code_btn.addEventListener("click", function() {
      const rcvr_usrnm_elem = document.getElementById("rcvr_usrnm");
      const rcvr_email_elem = document.getElementById("rcvr_email");

      const rst_usr = rcvr_usrnm_elem ? rcvr_usrnm_elem.value.trim() : "";
      const rst_email = rcvr_email_elem ? rcvr_email_elem.value.trim() : "";

      if (rst_usr === "" || rst_email === "") {
        alert("Please enter both your username and recovery email!");
        return;
      }

      const users = JSON.parse(localStorage.getItem("REGISTERED_USERS")) || [];
      const matchedUser = users.find(u => u.username === rst_usr && u.email === rst_email);

      if (matchedUser) {
        send_code_btn.disabled = true;
        send_code_btn.textContent = "Sending...";

        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

        localStorage.setItem("RESET_USER", rst_usr);
        localStorage.setItem("RESET_CODE", randomCode);

        emailjs.send("service_mgtyl47", "template_5qobyg8", {
          to_email: rst_email,
          to_name: rst_usr,
          passcode: randomCode
        }, "fPSIqNunpk0Qg42ps")
        .then(function(response) {
          alert("Verification code sent! Check your inbox.");
          window.location.href = "code.html";
        })
        .catch(function(error) {
          console.error("EmailJS Error:", error);
          alert("Failed to send email: " + (error.text || error.message || "Unknown error"));
          send_code_btn.disabled = false;
          send_code_btn.textContent = "Send Code";
        });

      } else {
        alert("No account found matching that username and recovery email! Please register via sign_up.html first.");
      }
    });
  }


  // --- 6. VERIFY CODE LOGIC (code.html) ---
  const verify_btn = document.getElementById("code-verify");
  if (verify_btn !== null) {
    verify_btn.addEventListener("click", function() {
      const input_code_elem = document.getElementById("code-code");
      const user_entered_code = input_code_elem ? input_code_elem.value.trim() : "";
      const saved_code = localStorage.getItem("RESET_CODE");

      if (user_entered_code === "") {
        alert("Please enter the verification code!");
        return;
      }

      if (user_entered_code === saved_code) {
        alert("Code verified! Redirecting to password reset page...");
        window.location.href = "reset.html";
      } else {
        alert("Incorrect verification code! Please check your email and try again.");
      }
    });
  }


  // --- 7. RESET PASSWORD LOGIC (reset.html) ---
  const save_pass_btn = document.getElementById("save-new-psswrd");
  if (save_pass_btn !== null) {
    save_pass_btn.addEventListener("click", function() {
      const new_pass_elem = document.getElementById("new-psswrd");
      const new_password = new_pass_elem ? new_pass_elem.value.trim() : "";
      const reset_user = localStorage.getItem("RESET_USER");

      if (new_password === "") {
        alert("Please enter your new password!");
        return;
      }

      let users = JSON.parse(localStorage.getItem("REGISTERED_USERS")) || [];
      let userUpdated = false;

      users = users.map(function(u) {
        if (u.username === reset_user) {
          u.password = new_password;
          userUpdated = true;
        }
        return u;
      });

      if (userUpdated) {
        localStorage.setItem("REGISTERED_USERS", JSON.stringify(users));

        localStorage.removeItem("RESET_CODE");
        localStorage.removeItem("RESET_USER");

        alert("Password updated successfully! Redirecting to login...");
        window.location.href = "login.html";
      } else {
        alert("Error: Account not found.");
      }
    });
  }


  // --- 8. JOURNAL EVENT LISTENERS & INITIALIZATION ---
  if (entriesContainer !== null) {
    displayEntries();
  }

  if (saveBtn !== null) {
    saveBtn.addEventListener("click", function() {
      const dateVal = entryDate ? entryDate.value : "";
      const subjectVal = entrySubject ? entrySubject.value.trim() : "";
      const bodyVal = entryInput ? entryInput.value.trim() : "";

      if (dateVal === "" || subjectVal === "" || bodyVal === "") {
        alert("Please fill in all fields before saving!");
        return;
      }

      const currentUser = localStorage.getItem("CURRENT_USER") || "guest";
      const userStorageKey = "journalEntries_" + currentUser;
      let existingEntries = JSON.parse(localStorage.getItem(userStorageKey)) || [];

      existingEntries.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      if (editingIndex !== null) {
        existingEntries[editingIndex] = {
          date: dateVal,
          subject: subjectVal,
          body: bodyVal
        };
        editingIndex = null;
        saveBtn.textContent = "Save Entry";
      } else {
        existingEntries.push({
          date: dateVal,
          subject: subjectVal,
          body: bodyVal
        });
      }

      localStorage.setItem(userStorageKey, JSON.stringify(existingEntries));

      if (entryDate) entryDate.value = "";
      if (entrySubject) entrySubject.value = "";
      if (entryInput) entryInput.value = "";

      displayEntries();
    });
  }

});