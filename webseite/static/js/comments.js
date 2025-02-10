$(document).ready(function () {
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

  // Erstellen eines Kommentars mit AJAX-Anfrage
  function createComment(projectId, commentText) {
    $.ajax({
      url: `/project/comment-create/${projectId}/`,
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        text: commentText,
      },
      success: function () {
        commentList(projectId);
        $("#commentForm").val("");
        $("#comment").modal("hide");
      },
    });
  }

  // Öffnet das Kommentarformular, wenn createComment geklickt wird
  $("#createComment").on("click", function () {
    var projectId = $("#bookmarkId").attr("projectBookmark");
    $("#project_id").val(projectId);
    $("#comment").modal("show");
  });

  // Kommentar erstellen, wenn submitComment geklickt wird
  $("#submitComment").on("click", function (e) {
    e.preventDefault();
    var projectId = $("#project_id").val();
    var commentText = $("#commentForm").val();
    createComment(projectId, commentText);
  });

  // Abrufen Kommentar mit AJAX-Anfrage
  function commentList(project_id) {
    $.ajax({
      url: "/project/projectdetail/" + project_id + "/",
      method: "GET",
      success: function (data) {
        $("#commentOutput").empty();
        data.comments.forEach(function (document) {
          var htmlComments = `
                <div class="col-12 mt-5">
                    <figure>
                    <figcaption class="blockquote-footer">
                        <cite title="Source Title" class="user-name">
                        ${document.user} ${
            document.can_edit
              ? `<i data-comment-id="${document.id}" class="changeComment-data fa-regular fa-pen-to-square"></i> <i data-comment-id="${document.id}" class="commentDeleteButton-data fa-solid fa-trash"></i>`
              : ""
          } 
                        </cite>
                    </figcaption>
                    </figure>
                    <small id="commentText">${document.text}</small><br>
                    <small>${document.date}</small>
                    <hr>
                </div>
                `;
          $("#commentOutput").append(htmlComments);
        });
      },
    });
  }

  // Aktualisieren eines Kommentars mit AJAX-Anfrage
  function updateComment(projectId, commentId, commentText) {
    $.ajax({
      url: `/project/comment-update/${commentId}/`,
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        text: commentText,
      },
      success: function () {
        commentList(projectId);
        $("#commentForm").val("");
        $("#comment").modal("hide");
      },
    });
  }

  // Kommentar bearbeiten, wenn Elemente von .changeComment-data geklickt wird
  $("body").on("click", ".changeComment-data", function () {
    $("#changeComment").removeClass("d-none");
    $("#submitComment").addClass("d-none");
    var projectId = $("#bookmarkId").attr("projectBookmark");
    var commentId = $(this).attr("data-comment-id");
    var commentText = $(this).closest(".col-12").find(".commentText").text();
    $("#comment_id").val(commentId);
    $("#commentForm").val(commentText);
    $("#project_id").val(projectId);
    $("#comment").modal("show");
  });

  // Kommentar aktualisieren, wenn changeComment geklickt wird
  $("#changeComment").on("click", function () {
    var projectId = $("#project_id").val();
    var commentId = $("#comment_id").val();
    var commentText = $("#commentForm").val();
    updateComment(projectId, commentId, commentText);
  });

  // Löschen eines Kommentars mit AJAX-Anfrage
  function deleteComment(commentId, projectId) {
    $.ajax({
      url: `/project/comment-delete/${commentId}/`,
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function () {
        commentList(projectId);
        $("#commentDeleteConfirmModal").modal("hide");
      },
    });
  }

  // Bestätigung für die Löschung eines Kommentars
  $("body").on("click", ".commentDeleteButton-data", function () {
    $("#textDeleteCommment").text("Kommentar endgültig löschen?");
    var projectId = $("#bookmarkId").attr("projectBookmark");
    var commentId = $(this).attr("data-comment-id");
    $("#projectCommentId").val(projectId);
    $("#commentDeleteID").val(commentId);
    $("#commentDeleteConfirmModal").modal("show");
  });

  // Kommentar löschen, wenn commentDeleteButton geklickt wird
  $("#commentDeleteButton").on("click", function () {
    var commentId = $("#commentDeleteID").val();
    var projectId = $("#projectCommentId").val();
    deleteComment(commentId, projectId);
  });

  // Kommentar Modal leeren
  $("#commentClose").on("click", function () {
    $("#commentForm").val("");
    $("#user_id").val("");
    $("#project_id").val("");
    $("#comment_id").val("");
  });
});
