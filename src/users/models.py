from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modelo de usuario que extiende AbstractUser.
    """

    email = models.EmailField(
        unique=True, help_text="Correo electrónico del usuario", max_length=255
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
