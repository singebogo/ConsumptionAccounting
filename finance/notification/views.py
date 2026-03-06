# notification/views.py

import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.contrib.auth.models import User

from .models import Notification, UserNotification, Message
from .serializers import UserNotificationSerializer, MessageSerializer

import logging

logger = logging.getLogger(__name__)


# ==================== 辅助函数 ====================

def cors_json_response(data, status=200):
    """返回支持CORS的JSON响应"""
    response = JsonResponse(data, status=status)
    response['Access-Control-Allow-Origin'] = 'http://localhost:63342'
    response['Access-Control-Allow-Credentials'] = 'true'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
    return response


def check_user_authenticated(request, username):
    """检查用户是否已认证，未认证返回统一响应"""
    from django.contrib.auth.models import User
    user = User.objects.get(username=username)
    request.user = user  # 设置user对象供后续使用
    if not request.user.is_authenticated:
        return cors_json_response({
            'code': '401',
            'msg': '未登录或登录已过期',
            'data': {
                'notification': 0,
                'message': 0,
                'total': 0,
                'list': []
            }
        })
    return None


# ==================== 通知相关API ====================

@csrf_exempt
def notification_list(request):
    """获取当前用户的通知列表"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        # ✅ 1. 先检查用户认证状态
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            # 获取参数
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            unread_only = request.GET.get('unread_only', 'false') == 'true'
            notification_type = request.GET.get('type', '')

            # ✅ 2. 只有认证用户才执行查询
            queryset = UserNotification.objects.filter(
                user=request.user,  # 此时request.user一定是User实例
                is_deleted=False
            ).select_related('notification')

            if unread_only:
                queryset = queryset.filter(is_read=False)

            if notification_type:
                queryset = queryset.filter(notification__type=notification_type)

            # 排序
            queryset = queryset.order_by('-created_at')

            # 分页
            paginator = Paginator(queryset, page_size)
            notifications = paginator.get_page(page)

            # 序列化
            serializer = UserNotificationSerializer(notifications, many=True)

            # 统计未读数量
            unread_count = UserNotification.objects.filter(
                user=request.user,
                is_read=False,
                is_deleted=False
            ).count()

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    'list': serializer.data,
                    'total': paginator.count,
                    'page': page,
                    'page_size': page_size,
                    'unread_count': unread_count
                }
            })
        except Exception as e:
            logger.error(f"获取通知列表失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def notification_mark_read(request):
    """标记通知为已读"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # ✅ 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            data = json.loads(request.body)
            notification_ids = data.get('ids', [])

            if not notification_ids:
                return cors_json_response({'code': '0', 'msg': '请选择要标记的通知'})

            # 批量标记已读
            UserNotification.objects.filter(
                user=request.user,
                id__in=notification_ids,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )

            # 获取剩余未读数量
            unread_count = UserNotification.objects.filter(
                user=request.user,
                is_read=False,
                is_deleted=False
            ).count()

            return cors_json_response({
                'code': '1',
                'msg': f'成功标记{len(notification_ids)}条通知',
                'data': {'unread_count': unread_count}
            })
        except Exception as e:
            logger.error(f"标记已读失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def notification_mark_all_read(request):
    """标记所有通知为已读"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # ✅ 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            count = UserNotification.objects.filter(
                user=request.user,
                is_read=False,
                is_deleted=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )

            return cors_json_response({
                'code': '1',
                'msg': f'成功标记{count}条通知',
                'data': {'unread_count': 0}
            })
        except Exception as e:
            logger.error(f"标记全部已读失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def notification_delete(request):
    """删除通知"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # ✅ 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            data = json.loads(request.body)
            notification_ids = data.get('ids', [])

            if not notification_ids:
                return cors_json_response({'code': '0', 'msg': '请选择要删除的通知'})

            # 软删除
            UserNotification.objects.filter(
                user=request.user,
                id__in=notification_ids
            ).update(is_deleted=True)

            return cors_json_response({
                'code': '1',
                'msg': f'成功删除{len(notification_ids)}条通知'
            })
        except Exception as e:
            logger.error(f"删除通知失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


# ==================== 消息相关API ====================

@csrf_exempt
def message_list(request):
    """获取消息列表"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        username = request.GET.get('username', '')
        request.username = username
        # ✅ 检查用户认证
        auth_response = check_user_authenticated(request, username)
        if auth_response:
            return auth_response

        try:
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            folder = request.GET.get('folder', 'inbox')


            # 基础查询
            if folder == 'inbox':
                queryset = Message.objects.filter(
                    recipient=request.user,
                    is_deleted_by_recipient=False
                )
            elif folder == 'sent':
                queryset = Message.objects.filter(
                    sender=request.user,
                    is_deleted_by_sender=False
                )
            elif folder == 'starred':
                queryset = Message.objects.filter(
                    Q(recipient=request.user) | Q(sender=request.user),
                    is_starred=True,
                    is_deleted_by_recipient=False,
                    is_deleted_by_sender=False
                )
            elif folder == 'unread':
                queryset = Message.objects.filter(
                    recipient=request.user,
                    is_read=False,
                    is_deleted_by_recipient=False
                )
            else:
                queryset = Message.objects.none()

            # 排序
            queryset = queryset.order_by('-sent_at')

            # 分页
            paginator = Paginator(queryset, page_size)
            messages = paginator.get_page(page)

            # 序列化
            serializer = MessageSerializer(messages, many=True)

            # 统计未读数量
            unread_count = Message.objects.filter(
                recipient=request.user,
                is_read=False,
                is_deleted_by_recipient=False
            ).count()

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    'list': serializer.data,
                    'total': paginator.count,
                    'page': page,
                    'page_size': page_size,
                    'unread_count': unread_count
                }
            })
        except Exception as e:
            logger.error(f"获取消息列表失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


# ==================== 未读数量API（特殊处理：未登录返回0） ====================

@csrf_exempt
def get_unread_count(request):
    """获取未读通知和消息数量 - 未登录用户返回0"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        try:
            # ✅ 未登录用户直接返回0，不查询数据库
            if not request.user.is_authenticated:
                return cors_json_response({
                    'code': '1',
                    'msg': 'success',
                    'data': {
                        'notification': 0,
                        'message': 0,
                        'total': 0
                    }
                })

            # ✅ 已登录用户才查询数据库
            notification_unread = UserNotification.objects.filter(
                user=request.user,
                is_read=False,
                is_deleted=False
            ).count()

            message_unread = Message.objects.filter(
                recipient=request.user,
                is_read=False,
                is_deleted_by_recipient=False
            ).count()

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    'notification': notification_unread,
                    'message': message_unread,
                    'total': notification_unread + message_unread
                }
            })
        except Exception as e:
            logger.error(f"获取未读数量失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})

@csrf_exempt
def message_send(request):
    """发送消息"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            data = json.loads(request.body)

            recipient_id = data.get('recipient_id')
            title = data.get('title', '')
            content = data.get('content', '')

            # 验证参数
            if not recipient_id:
                return cors_json_response({'code': '0', 'msg': '请选择收件人'})

            if not content:
                return cors_json_response({'code': '0', 'msg': '消息内容不能为空'})

            # 获取收件人
            try:
                recipient = User.objects.get(id=recipient_id)
            except User.DoesNotExist:
                return cors_json_response({'code': '0', 'msg': '收件人不存在'})

            # 创建消息
            message = Message.objects.create(
                sender=request.user,
                recipient=recipient,
                title=title or content[:50],
                content=content
            )

            # 处理附件（如果有）
            attachment = data.get('attachment')
            if attachment:
                # 这里添加附件处理逻辑
                pass

            return cors_json_response({
                'code': '1',
                'msg': '发送成功',
                'data': {'id': message.id}
            })
        except json.JSONDecodeError:
            return cors_json_response({'code': '0', 'msg': '请求数据格式错误'})
        except Exception as e:
            logger.error(f"发送消息失败: {e}")
            return cors_json_response({'code': '0', 'msg': f'发送失败: {str(e)}'})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


# ==================== 消息相关API ====================

@csrf_exempt
def message_list(request):
    """获取消息列表"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        username = request.GET.get('username', '')  # 搜索关键词
        # 检查用户认证
        auth_response = check_user_authenticated(request, username)
        if auth_response:
            return auth_response

        try:
            # 获取参数
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            folder = request.GET.get('folder', 'inbox')  # inbox, sent, starred, unread, trash
            keyword = request.GET.get('keyword', '')  # 搜索关键词


            # 基础查询
            if folder == 'inbox':
                queryset = Message.objects.filter(
                    recipient=request.user,
                    is_deleted_by_recipient=False
                )
            elif folder == 'sent':
                queryset = Message.objects.filter(
                    sender=request.user,
                    is_deleted_by_sender=False
                )
            elif folder == 'starred':
                queryset = Message.objects.filter(
                    Q(recipient=request.user) | Q(sender=request.user),
                    is_starred=True,
                    is_deleted_by_recipient=False,
                    is_deleted_by_sender=False
                )
            elif folder == 'unread':
                queryset = Message.objects.filter(
                    recipient=request.user,
                    is_read=False,
                    is_deleted_by_recipient=False
                )
            elif folder == 'trash':
                # 回收站：发送者或接收者删除的消息
                queryset = Message.objects.filter(
                    Q(sender=request.user, is_deleted_by_sender=True) |
                    Q(recipient=request.user, is_deleted_by_recipient=True)
                )
            else:
                queryset = Message.objects.none()

            # 关键词搜索
            if keyword:
                queryset = queryset.filter(
                    Q(title__icontains=keyword) |
                    Q(content__icontains=keyword) |
                    Q(sender__username__icontains=keyword) |
                    Q(recipient__username__icontains=keyword)
                )

            # 排序
            queryset = queryset.order_by('-sent_at')

            # 分页
            paginator = Paginator(queryset, page_size)
            messages = paginator.get_page(page)

            # 序列化
            serializer = MessageSerializer(messages, many=True)

            # 统计未读数量
            unread_count = Message.objects.filter(
                recipient=request.user,
                is_read=False,
                is_deleted_by_recipient=False
            ).count()

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    'list': serializer.data,
                    'total': paginator.count,
                    'page': page,
                    'page_size': page_size,
                    'unread_count': unread_count,
                    'total_pages': paginator.num_pages
                }
            })
        except Exception as e:
            logger.error(f"获取消息列表失败: {e}")
            return cors_json_response({
                'code': '0',
                'msg': f'获取消息列表失败: {str(e)}'
            })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })


@csrf_exempt
def message_send(request):
    """发送消息"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # 检查用户认证
        auth_response = check_user_authenticated(request, )
        if auth_response:
            return auth_response

        try:
            # 解析请求数据
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST.dict()

            recipient_id = data.get('recipient_id') or data.get('recipient')
            title = data.get('title', '').strip()
            content = data.get('content', '').strip()
            reply_to = data.get('reply_to')  # 回复的消息ID

            # 验证必填字段
            if not recipient_id:
                return cors_json_response({
                    'code': '0',
                    'msg': '请选择收件人'
                })

            if not content:
                return cors_json_response({
                    'code': '0',
                    'msg': '消息内容不能为空'
                })

            # 获取收件人
            try:
                recipient = User.objects.get(id=recipient_id)
            except User.DoesNotExist:
                return cors_json_response({
                    'code': '0',
                    'msg': '收件人不存在'
                })

            # 检查是否给自己发送
            if recipient == request.user:
                return cors_json_response({
                    'code': '0',
                    'msg': '不能给自己发送消息'
                })

            # 创建消息
            message = Message.objects.create(
                sender=request.user,
                recipient=recipient,
                title=title or content[:50],
                content=content
            )

            # 如果是回复消息，关联父消息
            if reply_to:
                try:
                    parent_message = Message.objects.get(id=reply_to)
                    message.parent_message = parent_message
                    message.save()
                except Message.DoesNotExist:
                    pass

            # 处理附件
            attachment = data.get('attachment')
            if attachment:
                # TODO: 实现附件处理逻辑
                pass

            # 序列化返回
            serializer = MessageSerializer(message)

            return cors_json_response({
                'code': '1',
                'msg': '发送成功',
                'data': serializer.data
            })

        except json.JSONDecodeError:
            return cors_json_response({
                'code': '0',
                'msg': '请求数据格式错误'
            })
        except Exception as e:
            logger.error(f"发送消息失败: {e}")
            return cors_json_response({
                'code': '0',
                'msg': f'发送失败: {str(e)}'
            })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })


@csrf_exempt
def message_detail(request, message_id):
    """消息详情"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            message = get_object_or_404(Message, id=message_id)

            # 权限检查
            if message.recipient != request.user and message.sender != request.user:
                return cors_json_response({
                    'code': '0',
                    'msg': '无权限查看此消息'
                })

            # 标记为已读（收件人查看时）
            if message.recipient == request.user and not message.is_read:
                message.mark_as_read()

            # 序列化
            serializer = MessageSerializer(message)

            # 获取回复列表
            replies = Message.objects.filter(parent_message=message).order_by('sent_at')
            replies_serializer = MessageSerializer(replies, many=True)

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    **serializer.data,
                    'replies': replies_serializer.data
                }
            })
        except Message.DoesNotExist:
            return cors_json_response({
                'code': '0',
                'msg': '消息不存在'
            })
        except Exception as e:
            logger.error(f"获取消息详情失败: {e}")
            return cors_json_response({
                'code': '0',
                'msg': f'获取消息详情失败: {str(e)}'
            })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })


@csrf_exempt
def message_delete(request):
    """删除消息（软删除）"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            data = json.loads(request.body)
            message_ids = data.get('ids', [])
            permanent = data.get('permanent', False)  # 是否永久删除

            if not message_ids:
                return cors_json_response({
                    'code': '0',
                    'msg': '请选择要删除的消息'
                })

            deleted_count = 0
            for msg_id in message_ids:
                try:
                    message = Message.objects.get(id=msg_id)

                    if permanent:
                        # 永久删除（双方都删除了）
                        if (message.sender == request.user and message.is_deleted_by_sender) and \
                                (message.recipient == request.user and message.is_deleted_by_recipient):
                            message.delete()
                            deleted_count += 1
                    else:
                        # 软删除
                        if message.sender == request.user:
                            message.is_deleted_by_sender = True
                        if message.recipient == request.user:
                            message.is_deleted_by_recipient = True
                        message.save()
                        deleted_count += 1

                except Message.DoesNotExist:
                    continue

            return cors_json_response({
                'code': '1',
                'msg': f'成功删除{deleted_count}条消息'
            })
        except Exception as e:
            logger.error(f"删除消息失败: {e}")
            return cors_json_response({
                'code': '0',
                'msg': f'删除消息失败: {str(e)}'
            })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })


@csrf_exempt
def message_star(request):
    """标星/取消标星消息"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            data = json.loads(request.body)
            message_id = data.get('id')
            starred = data.get('starred', True)

            if not message_id:
                return cors_json_response({
                    'code': '0',
                    'msg': '请选择消息'
                })

            message = get_object_or_404(Message, id=message_id)

            # 权限检查
            if message.recipient != request.user and message.sender != request.user:
                return cors_json_response({
                    'code': '0',
                    'msg': '无权限操作此消息'
                })

            message.is_starred = starred
            message.save()

            return cors_json_response({
                'code': '1',
                'msg': '操作成功',
                'data': {
                    'id': message.id,
                    'is_starred': message.is_starred
                }
            })

        except Message.DoesNotExist:
            return cors_json_response({
                'code': '0',
                'msg': '消息不存在'
            })
        except Exception as e:
            logger.error(f"标星消息失败: {e}")
            return cors_json_response({
                'code': '0',
                'msg': f'操作失败: {str(e)}'
            })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })


@csrf_exempt
def message_restore(request):
    """从回收站恢复消息"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'POST':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            data = json.loads(request.body)
            message_ids = data.get('ids', [])

            if not message_ids:
                return cors_json_response({
                    'code': '0',
                    'msg': '请选择要恢复的消息'
                })

            restored_count = 0
            for msg_id in message_ids:
                try:
                    message = Message.objects.get(id=msg_id)

                    if message.sender == request.user:
                        message.is_deleted_by_sender = False
                        restored_count += 1
                    if message.recipient == request.user:
                        message.is_deleted_by_recipient = False
                        restored_count += 1

                    message.save()
                except Message.DoesNotExist:
                    continue

            return cors_json_response({
                'code': '1',
                'msg': f'成功恢复{restored_count}条消息'
            })
        except Exception as e:
            logger.error(f"恢复消息失败: {e}")
            return cors_json_response({
                'code': '0',
                'msg': f'恢复消息失败: {str(e)}'
            })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })