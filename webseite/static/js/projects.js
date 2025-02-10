$(document).ready(function () {
  var myDropzone;
  var projectId;

  const getCookie = (name) => {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  const csrftoken = getCookie("csrftoken");

  // Öffnet Projekterstellungsmodal, wenn createProject geklickt wird
  var myModal = $("#createProject");
  myModal.on("show.bs.modal", function () {
    setTimeout(autocompleteUser, 100);
  });

  // Autocomplete zugewiesenem Benutzer
  function autocompleteUser() {
    var valprojectName = $("#projectName").val();
    if (valprojectName === "") {
      $.ajax({
        method: "GET",
        url: "/project/autocomplete-user/",
        success: function (data) {
          var results = data.results;
          var select2Options = [];

          for (var i = 0; i < results.length; i++) {
            var user = results[i];
            var username = user.username;
            var option = {
              id: username,
              text: username,
            };
            select2Options.push(option);
          }
          $("#projectAllocate")
            .empty()
            .select2({
              theme: "bootstrap-5",
              width: $(this).data("width")
                ? $(this).data("width")
                : $(this).hasClass("w-100")
                ? "100%"
                : "style",
              placeholder: $(this).data("placeholder"),
              data: select2Options,
            });
        },
      });
    }
  }

  // Projekt erstellen, wenn saveButtonProject geklickt wird
  $("#saveButtonProject").on("click", function () {
    if (!validateForm()) {
      return;
    }
    var user_id = $("#user_id").val();
    var projectName = $("#projectName").val();
    var selectedUsers = $("#projectAllocate").val();
    var description = $("#description").val();

    $.ajax({
      url: "/project/create/",
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        user_id: user_id,
        projectName: projectName,
        selected_users: selectedUsers,
        description: description,
      },
      success: function (data) {
        projectId = data.project_id;
        $("#dropzone").removeClass("d-none");
        $(".tags-form").removeClass("d-none");
        $("#saveButtonProject").addClass("d-none");
        initializeDropzone();

        var alertProjectSuccess = $("#alertProject");
        alertProjectSuccess.append(`
                <div class="alert alert-success" role="alert">
                    Das Projekt wurde angelegt!
                </div>
                `);
        setTimeout(function () {
          $("#alertProject").hide("");
        }, 5000);
      },
    });
  });

  // Dropzone für Datei Upload im Projektformular
  function initializeDropzone() {
    Dropzone.autoDiscover = false;
    const myDropzone = new Dropzone("#dropzone", {
      url: "/project/upload-files/",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      init: function () {
        this.on("success", function (file, response) {
          updateProjectList();
          var urlParams = new URLSearchParams(window.location.search);
          var openModal = urlParams.get("project_open_modal");
          if (openModal === "true") {
            urlParams.delete("project_open_modal");
            var newUrl = window.location.pathname + "?" + urlParams.toString();
            window.history.replaceState({}, document.title, newUrl);
          }
        });
        console.log(projectId);
        this.on("sending", function (file, xhr, formData) {
          formData.append("csrfmiddlewaretoken", csrftoken);
          formData.append("project_id", projectId);
        });
      },
      maxFiles: 5,
      maxFilesize: 4,
      acceptedFiles:
        ".png, .jpg, .jpeg, .webp, .pdf, .txt, .docx, .xlsx, .pptx",
    });
  }

  // Öffnet Modal-Fenster auf Aktuelles, um neues Projekt zu erstellen
  function openModalIfParameterExists() {
    var urlParams = new URLSearchParams(window.location.search);
    var openModal = urlParams.get("project_open_modal");
    if (openModal === "true") {
      $("#createProject").modal("show");
      autocompleteUser();
    }
  }
  openModalIfParameterExists();

  // Entfernt Parameter aus  URL und lädt Seite neu
  function projectParameterRemove() {
    if (window.location.search.indexOf("project_open_modal=true") !== -1) {
      var newUrl = window.location.href.replace("?project_open_modal=true", "");
      history.pushState({}, document.title, newUrl);
      location.reload();
    }
  }

  // Schließt das Projekt und deaktiviert Dropzone
  $("#closeProject").click(function () {
    projectParameterRemove();
    if (myDropzone) {
      myDropzone.disable();
      myDropzone.removeAllFiles();
    }
  });

  // Öffnet Projektaktualisierungsmodal, wenn auf Icon updateProject geklickt wird
  $("#updateProject").on("click", function () {
    $("#createProject").modal("show");
    $("#saveButtonProject").addClass("d-none");
    $("#updateButtonProject").removeClass("d-none");

    var project_id = $(this).attr("data-project-id");

    $.ajax({
      url: "/project/projectdetail/" + project_id + "/",
      method: "GET",
      success: function (data) {
        $("#projectName").val(data.name);
        $("#description").val(data.description);

        var projectUsers = data.project_users;
        var selectField = $("#projectAllocate");
        var select2Options = [];

        for (var username in projectUsers) {
          if (projectUsers.hasOwnProperty(username)) {
            console.log(
              "Benutzername:",
              username,
              "Wert:",
              projectUsers[username]
            );

            var option = {
              id: username,
              text: username,
            };

            if (projectUsers[username]) {
              option.selected = true;
            }
            select2Options.push(option);
          }
        }
        selectField.select2({
          theme: "bootstrap-5",
          width: selectField.data("width")
            ? selectField.data("width")
            : selectField.hasClass("w-100")
            ? "100%"
            : "style",
          placeholder: selectField.data("placeholder"),
          data: select2Options,
        });
      },
    });
  });

  // Projektdaten anzeigen
  function detailViewProject(project_id) {
    $("[data-project]").removeClass("active");
    var viewCreatorProject = $("#viewCreatorProject");
    var viewNameProject = $("#viewNameProject");
    var viewDescriptionProject = $("#viewDescriptionProject");
    var documentsButton = $("#documentsButton");

    $(".project").attr("projectBookmark", project_id);
    $(".myHideClass").removeClass("d-none");
    $(".myViewClass").addClass("d-none");
    $("#updateProject").attr("data-project-id", project_id);

    $.ajax({
      url: "/project/projectdetail/" + project_id + "/",
      method: "GET",
      success: function (data) {
        $("#commentOutput").empty();
        var elementToActivate = $('[data-project="' + project_id + '"]');
        elementToActivate.addClass("active");

        data.comments.forEach(function (document) {
          var htmlComments = `
                <div class="col-12 mt-5">
                    <figure>
                    <figcaption class="blockquote-footer">
                        <cite title="Source Title" class="user-name">
                        ${document.user} ${
            document.can_edit
              ? `<i data-comment-id="${document.id}" class="changeComment-data fa-regular fa-pen-to-square"></i>
                <i data-comment-id="${document.id}" class="commentDeleteButton-data fa-solid fa-trash"></i>`
              : ""
          } 
                        </cite>
                    </figcaption>
                    </figure>
                    <small class="commentText">${document.text}</small><br>
                    <small>${document.date}</small>
                    <hr>
                </div>
                `;
          $("#commentOutput").append(htmlComments);
        });

        var userLogin = $("#userId").val();
        projectsCheckWatchlistStatus(userLogin, project_id);
        viewCreatorProject.text(data.username);
        viewDescriptionProject.text(data.description);
        viewNameProject.text(data.name);

        //Zugriffsrechte
        if (data.can_edit) {
          $("#updateProject").removeClass("d-none");
        } else {
          $("#updateProject").addClass("d-none");
        }

        if (data.can_delete) {
          $("#updateProject").removeClass("d-none");
          $("#trashDelete").removeClass("d-none");
        } else {
          $("#updateProject").removeClass("d-none");
          $("#trashDelete").addClass("d-none");
        }

        var count = 0;
        $("#projectAllocate").empty();
        $("#viewAssignedUser").empty();
        for (var username in data.project_users) {
          if (
            data.project_users.hasOwnProperty(username) &&
            data.project_users[username] === true
          ) {
            count++;
            if (count > 1) {
              var htmlUser = `<div class="mx-1">,${username}</div>`;
            } else {
              var htmlUser = `<div>${username}</div>`;
            }
            $(htmlUser).appendTo("#viewAssignedUser");
          }
        }

        if (data.documents && data.documents.length > 0) {
          documentsButton.html(
            '<a href="/documents/?project_id=' +
              project_id +
              '"type="button" class="btn btn-primary">Zu den Dokumenten</a>'
          );
        } else {
          documentsButton.html("");
        }
      },
    });
  }

  // Aktualisierung Projekt, wenn updateButtonProject geklickt wird
  $("#updateButtonProject").on("click", function () {
    var project_id = $("#updateProject").attr("data-project-id");
    var projectName = $("#projectName").val();
    var description = $("#description").val();

    var selectedUsers = $("#projectAllocate").val();
    var updatedData = {
      name: projectName,
      selected_users: selectedUsers,
      description: description,
    };

    $.ajax({
      url: `/project/update/${project_id}/`,
      method: "POST",
      data: updatedData,
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        if (data) {
          updateProjectList();
          detailViewProject(project_id);
          $("#createProject").modal("hide");
        }
      },
    });
  });

  // Projekt löschen, wenn Icon trashDelete geklickt wird
  $("#trashDelete").on("click", function () {
    var project_id = $("#updateProject").attr("data-project-id");

    $.ajax({
      url: `/project/delete/${project_id}/`,
      method: "GET",
      dataType: "json",
      success: function (data) {
        if (data.project_name) {
          $("#projectDeleteID").val(data.project_id);
          $("#textDelete").text(
            'Projekt "' + data.project_name + '" löschen bestätigen'
          );
          $("#deleteConfirmModal").modal("show");
        }
      },
    });
  });

  // Löscht Projekt über AJAX-Anfrage und aktualisiert Projektliste
  function deleteProject(projectId) {
    var viewNameProject = $("#viewNameProject");
    var viewAssignedUser = $("#viewAssignedUser");
    var viewCreatorProject = $("#viewCreatorProject");
    var viewDescriptionProject = $("#viewDescriptionProject");

    $.ajax({
      url: `/project/delete/${projectId}/`,
      method: "POST",
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        if (data) {
          $("#deleteConfirmModal").modal("hide");
          updateProjectList();

          viewCreatorProject.text("");
          viewDescriptionProject.text("");
          viewNameProject.text("");
          viewAssignedUser.text("");
        }
      },
    });
  }

  // Löschen von Projekt, wenn conformDeleteButton geklickt wird
  $("#confirmDeleteButton").on("click", function () {
    var project_id = $("#projectDeleteID").val();
    console.log(project_id);
    deleteProject(project_id);
    location.reload();
  });

  // Projektauswahl in der Projektliste
  $("#projectList").on("click", ".list-view", function () {
    var project_id = $(this).attr("data-project");
    detailViewProject(project_id);
  });

  // Aktualisierung der Projektliste
  function updateProjectList(
    searchQuery = "",
    userProjects = false,
    watchlistProjects = false,
    assignedProjects = false
  ) {
    $.ajax({
      url: "/project/projectlist/",
      method: "GET",
      data: {
        search: searchQuery,
        user_projects: userProjects ? "true" : "false",
        show_watchlist: watchlistProjects ? "true" : "false",
        assigned_projects: assignedProjects ? "true" : "false",
      },
      success: function (data) {
        var projects = data.projects;
        var projectList = $("#projectList");
        projectList.empty();

        if (watchlistProjects) {
          $.each(projects, function (index, project) {
            if (project.is_on_watchlist) {
              var projectListHtml = `
                            <a href="javascript:void(0);" data-project="${project.id}" class="list-group-item list-view list-group-item-action py-3 lh-tight">
                                <div class="d-flex w-100 align-items-center justify-content-between">
                                    <strong class="mb-1">${project.name}</strong>
                                    <span class="bookmark-icon2">&#9733;</span>
                                </div>
                                <div class="col-10 mb-1 small">${project.create}</div>
                            </a>
                            `;
              projectList.append(projectListHtml);
            }
          });
        } else {
          $.each(projects, function (index, project) {
            var extraClass = project.is_on_watchlist ? "marked" : "";
            var bookmarkStyle = project.is_on_watchlist
              ? 'style="color:red;"'
              : "";
            var projectListHtml = `
              <a href="javascript:void(0);" data-project="${project.id}" class="list-group-item list-view list-group-item-action py-3 lh-tight ${extraClass}">
                  <div class="d-flex w-100 align-items-center justify-content-between">
                      <strong class="mb-1">${project.name}</strong>
                      <span class="bookmark-icon" ${bookmarkStyle}>&#9733;</span>
                  </div>
                  <div class="col-10 mb-1 small">${project.user}  ${project.create}</div>
              </a>
              `;
            projectList.append(projectListHtml);
          });
        }
      },
    });
  }

  // Projekte suchen
  $("#searchProject").on("input", function () {
    var searchQuery = $(this).val();
    updateProjectList(searchQuery);
  });

  // Prüft URl-Parameter, aktualisiert Projektliste auf Suchanfrage
  function getUrlParameter(parameterName) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  }

  // Abfrage des URL Parameter und Aktualisierung der Projektliste
  var myProjectParameter = getUrlParameter("my_project");
  if (myProjectParameter === "true") {
    var searchQuery = $("#searchProject").val();
    updateProjectList(searchQuery, true, false, false);
  } else {
    updateProjectList();
  }

  // Überprüfung Markierliste von Projekten
  function projectsCheckWatchlistStatus(user, project) {
    var user_id = user;
    var project_id = project;

    $.ajax({
      url: "/project/check-watchlist/" + user_id + "/" + project_id + "/",
      type: "GET",
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        var iconElement = document.getElementById("bookmarkId");
        if (data.is_on_watchlist) {
          iconElement.classList.add("inWatchlist");
        } else {
          iconElement.classList.remove("inWatchlist");
        }
      },
    });
  }

  // Projekt zur Markierliste hinzufügen oder entfernen
  $("#bookmarkForm").on("click", ".project", function () {
    var project_id = $(this).attr("projectBookmark");
    var user_id = $("#userId").val();

    $.ajax({
      url: "/project/watch/",
      method: "POST",
      data: { user_id: user_id, project_id: project_id },
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        projectsCheckWatchlistStatus(user_id, project_id);
        location.reload();
      },      
    });
  });

  // Aktualisierung Liste alle Projekte, wenn NavLink geklickt wird
  $("#allProjects").on("click", function () {
    updateProjectList();
    $("#searchProject").val("");
  });

  // Aktualisierung Liste von Benutzer Projekte, wenn NavLink geklickt wird
  $(".nav-link-user-projects").on("click", function () {
    var searchQuery = $("#searchProject").val();
    updateProjectList(searchQuery, true);
  });

  // Aktualisierung Liste markierte Projekte, wenn NavLink geklickt wird
  $(".nav-link-watchlist-projects").on("click", function () {
    var searchQuery = $("#searchProject").val();
    updateProjectList(searchQuery, false, true);
  });

  // Aktualisierung Liste zugewiesene Projekte, wenn NavLink geklickt wird
  $("#assignedProjects").on("click", function () {
    updateProjectList(searchQuery, false, false, true);
  });

  // Entfernt URL-Parameter, aktualisiert Browser-URL ohne my_project
  function resetMyProjectParameter() {
    var url = new URL(window.location.href);
    url.searchParams.delete("my_project");
    window.location.href = url.toString();
  }

  // Anzeige aller Projekte, wenn allProjects geklickt wird
  document.getElementById("allProjects").addEventListener("click", function () {
    resetMyProjectParameter();
  });

  // Projektformular schließen, wenn closeProject geklickt wird
  $("#closeProject").on("click", function () {
    $("#projectName").val("");
    $("#toAssign").val("");
    $("#description").val("");
    var myDropzone = Dropzone.forElement("#dropzone");
    myDropzone.removeAllFiles();
    $("#dropzone").addClass("d-none");
    $("#saveButtonProject").removeClass("d-none");
    location.reload();
  });

  // Verbirgt Fehlermeldung bei Eingabe oder Änderung in Eingabefelder
  $("#projectName, #description, #projectAllocate").on(
    "input change",
    function () {
      hideErrorMessage();
    }
  );

  // Validierung der Eingabefelder
  function validateForm() {
    var projectName = $("#projectName").val();
    var description = $("#description").val();

    if (!projectName || projectName.trim() === "") {
      displayErrorMessage("Projektname ist erforderlich.");
      return false;
    }
    if (!description || description.trim() === "") {
      displayErrorMessage("Beschreibung ist erforderlich.");
      return false;
    }
    return true;
  }

  // Fehlermeldung
  function displayErrorMessage(message) {
    $("#errorAlert").text(message);
    $("#errorAlert").show();
  }

  function hideErrorMessage() {
    $("#errorAlert").hide();
  }
});
