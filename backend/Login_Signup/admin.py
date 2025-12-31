from django.contrib import admin
from .models import (
    Profile,
    Status,
    PasswordResetOTP,
    ChatSession,
    ChatMessage,
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "name",
        "age",
        "gender",
        "bloodgroup",
    )
    search_fields = ("user__username", "name")
    list_filter = ("gender", "bloodgroup")
    readonly_fields = ("uuid",)


@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ("user", "profile_completed")
    list_filter = ("profile_completed",)
    search_fields = ("user__username",)


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "attempts")
    readonly_fields = ("created_at",)
    search_fields = ("user__username",)
    ordering = ("-created_at",)


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "created_at")
    search_fields = ("user__username", "title")
    ordering = ("-created_at",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("session", "role", "short_text", "created_at")
    list_filter = ("role",)
    search_fields = ("text",)
    ordering = ("-created_at",)

    def short_text(self, obj):
        return obj.text[:40]

    short_text.short_description = "Message"
