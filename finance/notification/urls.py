from django.urls import path
from . import views

app_name = 'notification'

urlpatterns = [
    # 通知相关
    path('api/notifications/', views.notification_list, name='notification_list'),
    path('api/notifications/mark-read/', views.notification_mark_read, name='notification_mark_read'),
    path('api/notifications/mark-all-read/', views.notification_mark_all_read, name='notification_mark_all_read'),
    path('api/notifications/delete/', views.notification_delete, name='notification_delete'),

    # 消息相关
    path('api/messages/', views.message_list, name='message_list'),
    path('api/messages/send/', views.message_send, name='message_send'),
    path('api/messages/<int:message_id>/', views.message_detail, name='message_detail'),
    path('api/messages/delete/', views.message_delete, name='message_delete'),
    path('api/messages/star/', views.message_star, name='message_star'),

    # 统计
    path('api/unread/count/', views.get_unread_count, name='unread_count'),
]