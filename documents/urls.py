from django.urls import path

from .views import (DocumentCreateView,
                    DocumentUpdateView,
                    DocumentDeleteView,
                    DocumentFilterView,
                    ProjectsAutocompleteView,
                    TagCreateView,
                    TagUpdateView,
                    TagDeleteView,
                    TagListView,
                    TagsAutocompleteView,
                    UserListView,
                    DocumentArchiveView,
                    DocumentWatchView,
                    DocumentInWatchlistView
                    )

app_name = 'documents'

urlpatterns = [
    path('create/', DocumentCreateView.as_view(), name='document_create'),
    path('update/<pk>/', DocumentUpdateView.as_view(), name='document_update'),
    path('delete/<pk>/', DocumentDeleteView.as_view(), name='document_delete'),
    path('filter/', DocumentFilterView.as_view(), name='document_filter'),
    path('autocomplete-project/', ProjectsAutocompleteView.as_view(), name='autocomplete_projects'),
    path('tag-create/', TagCreateView.as_view(), name='tag_create'),
    path('tag-update/<pk>/', TagUpdateView.as_view(), name='tag_update'),
    path('tag-delete/<pk>/', TagDeleteView.as_view(), name='tag_delete'),
    path('tag-select/', TagListView.as_view(), name='tag_select'),
    path('autocomplete-tags/', TagsAutocompleteView.as_view(), name='autocomplete_tags'),
    path('user-select/', UserListView.as_view(), name='user_select'),
    path('', DocumentArchiveView.as_view(), name='documents_view_list'),
    path('watch/', DocumentWatchView.as_view(), name='document_watch'),
    path('check-watchlist/<int:user_id>/<int:project_id>/', DocumentInWatchlistView.as_view(), name='document_watchlist'),
]