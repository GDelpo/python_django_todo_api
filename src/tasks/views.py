from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from rest_framework import filters, permissions, viewsets

from .filters import TaskFilter
from .models import Task
from .serializers import TaskSerializer


@extend_schema(tags=["Tasks"])  # tag global
@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                name="created_at_after",
                type=OpenApiTypes.DATETIME,
                location=OpenApiParameter.QUERY,
                description="Filtra tareas creadas desde esta fecha/hora (inclusive)",
                required=False,
            ),
            OpenApiParameter(
                name="created_at_before",
                type=OpenApiTypes.DATETIME,
                location=OpenApiParameter.QUERY,
                description="Filtra tareas creadas hasta esta fecha/hora (inclusive)",
                required=False,
            ),
        ]
    )
)
class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet que provee las acciones CRUD para el modelo Task.
    """

    # 1. El Serializer que debe usar para la conversión a JSON.
    serializer_class = TaskSerializer

    # 2. Los permisos requeridos. `IsAuthenticated` solo permite el acceso
    # a usuarios que hayan iniciado sesión (que tengan un token JWT válido).
    permission_classes = [permissions.IsAuthenticated]

    # Filtros, búsquedas y orden
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "due_date", "priority", "status"]
    ordering = ["-created_at"]

    # Modificamos este método
    def get_queryset(self):
        """
        Este método ahora maneja de forma segura la generación del esquema.
        """
        # Si la vista está siendo accedida por swagger, devolvemos un queryset vacío.
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()

        # Para peticiones reales, mantenemos la lógica original.
        return self.request.user.tasks.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
