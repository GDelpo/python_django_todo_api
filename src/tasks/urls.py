from rest_framework.routers import DefaultRouter

from .views import TaskViewSet

# Creamos un router
router = DefaultRouter()
# Registramos nuestro ViewSet. 'tasks' será el prefijo del endpoint.
router.register(r"tasks", TaskViewSet, basename="task")

# Las URLs de la API son generadas automáticamente por el router.
urlpatterns = router.urls
