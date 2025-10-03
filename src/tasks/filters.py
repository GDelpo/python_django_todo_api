import django_filters as filters

from .models import Task


class TaskFilter(filters.FilterSet):
    """Filtros para Task, incluyendo rango de creación y vencimiento."""

    created_at = filters.IsoDateTimeFromToRangeFilter(field_name="created_at")
    due_date = filters.DateFromToRangeFilter(field_name="due_date")

    class Meta:
        model = Task
        fields = ["priority", "status", "due_date", "created_at"]
