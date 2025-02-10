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

  // tagFormTag Daten an Server senden, wenn submitTags geklickt wird
  $("#submitTags").on("click", function (e) {
    e.preventDefault();

    var tagFormTag = $("#tagFormTag").val();

    $.ajax({
      url: "/documents/tag-create/",
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        tagFormTag: tagFormTag,
      },
      success: function (data) {
        console.log(data);
        setTimeout(function () {
          location.reload();
        }, 200);
      },
    });
  });

  //Verwaltung von Tags, wenn manageTags geklickt wird
  $("#manageTags").on("click", function () {
    $("#manageTagsUpdate").modal("show");

    $.ajax({
      url: "/documents/tag-select/",
      method: "GET",
      dataType: "json",
      success: function (data) {
        var tagsResultsDiv = $("#tagsResults");
        tagsResultsDiv.empty();

        $.each(data.tags, function (index, item) {
          html = `
                <div class="input-group mt-3">
                    <input type="text" class="form-control" id="tagFormTagVal${item.id}" value="${item.name}">
                    <button data-tags-edit="${item.id}" class="btn btn-outline-secondary tagsEdit" type="button">Speichern</button>
                    <button data-tags-delete="${item.id}" class="btn btn-outline-danger tagsDelete" type="button">Löschen</button>
                </div>
                `;
          tagsResultsDiv.append(html);
        });
      },
    });
  });

  // Aktualisieren von Tags, wenn tagsEdit geklickt wird
  $("body").on("click", ".tagsEdit", function () {
    var tagsId = $(this).attr("data-tags-edit");
    var tagFormTagVal = $("#tagFormTagVal" + tagsId).val();

    var updatedData = {
      name: tagFormTagVal,
    };

    $.ajax({
      url: `/documents/tag-update/${tagsId}/`,
      method: "POST",
      data: updatedData,
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        setTimeout(function () {
          location.reload();
        }, 100);
      },
    });
  });

  // Löschen von Tags, wenn tagsDelete geklickt wird
  $("body").on("click", ".tagsDelete", function () {
    var tagsId = $(this).attr("data-tags-delete");

    $.ajax({
      url: `/documents/tag-delete/${tagsId}/`,
      method: "POST",
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        setTimeout(function () {
          location.reload();
        }, 100);
      },
    });
  });
});
