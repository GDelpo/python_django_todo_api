from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo User. Expone los campos básicos del usuario.
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
