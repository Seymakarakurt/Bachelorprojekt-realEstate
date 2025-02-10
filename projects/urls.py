from django.urls import path
from .views import (ProjectCreateView,
                    ProjectUpdateView,
                    ProjectDeleteView,
                    UploadFilesView,
                    ProjectListView, 
                    ProjectDetailAndPermissionsView, 
                    ProjectListUserView, 
                    UserAutocompleteView, 
                    CommentCreateView,
                    CommentUpdateView,
                    CommentDeleteView,
                    ProjectWatchView,
                    ProjectInWatchlistView,  
                    )

app_name = 'projects'

urlpatterns = [
    path('create/', ProjectCreateView.as_view(), name='project_create'),
    path('update/<int:pk>/', ProjectUpdateView.as_view(), name='project_update'),
    path('delete/<int:pk>/', ProjectDeleteView.as_view(), name='project_delete'),
    path('upload-files/', UploadFilesView.as_view(), name='upload_files'),
    path('projectlist/', ProjectListView.as_view(), name='projectlist'),
    path('projectdetail/<int:project_id>/', ProjectDetailAndPermissionsView.as_view(), name='projectdetail'),
    path('', ProjectListUserView.as_view(), name='project_view_list'),
    path('autocomplete-user/', UserAutocompleteView.as_view(), name='autocomplete_user'),
    path('comment-create/<int:project_id>/', CommentCreateView.as_view(), name='comment_create'),
    path('comment-update/<int:pk>/', CommentUpdateView.as_view(), name='comment_update'),
    path('comment-delete/<int:pk>/', CommentDeleteView.as_view(), name='comment_delete'),
    path('watch/', ProjectWatchView.as_view(), name='project_watch'),
    path('check-watchlist/<int:user_id>/<int:project_id>/', ProjectInWatchlistView.as_view(), name='project_watchlist'),   
]