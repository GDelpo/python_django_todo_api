from django.conf import settings
from django.db import models


class Priority(models.TextChoices):
    LOW = "LOW", "Baja"
    MEDIUM = "MEDIUM", "Media"
    HIGH = "HIGH", "Alta"


class Status(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    IN_PROGRESS = "IN_PROGRESS", "En Progreso"
    COMPLETED = "COMPLETED", "Completada"


class Task(models.Model):
    title = models.CharField("Título", max_length=200)
    description = models.TextField("Descripción", max_length=1000, blank=True)
    priority = models.CharField(
        "Prioridad", max_length=10, choices=Priority.choices, default=Priority.MEDIUM
    )
    status = models.CharField(
        "Estado", max_length=12, choices=Status.choices, default=Status.PENDING
    )
    due_date = models.DateField("Fecha de Vencimiento", null=True, blank=True)

    created_at = models.DateTimeField("Fecha de Creación", auto_now_add=True)
    updated_at = models.DateTimeField("Fecha de Actualización", auto_now=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="tasks", on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = "Tarea"
        verbose_name_plural = "Tareas"
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return self.title
