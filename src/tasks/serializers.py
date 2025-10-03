from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Serializer para Task con owner solo lectura (id y email)."""

    owner_id = serializers.ReadOnlyField(source="owner.id")
    owner_email = serializers.ReadOnlyField(source="owner.email")

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "priority",
            "status",
            "due_date",
            "created_at",
            "updated_at",
            "owner_id",
            "owner_email",
        )
