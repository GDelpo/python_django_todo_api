from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


class TestUserAuthAPI(APITestCase):
    base_url = "/api/auth/"

    def test_register_login_and_me(self):
        # Register
        payload = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "StrongPass123",
            "re_password": "StrongPass123",
        }
        res = self.client.post(self.base_url + "users/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Login (JWT create)
        res = self.client.post(
            self.base_url + "jwt/create/",
            {
                "email": payload["email"],
                "password": payload["password"],
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        access = res.data["access"]

        # Current user
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.get(self.base_url + "users/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], payload["email"])

    def test_me_unauthorized(self):
        res = self.client.get(self.base_url + "users/me/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_email_registration(self):
        User = get_user_model()
        User.objects.create_user(
            email="dup@example.com", username="dup", password="x1234567"
        )
        payload = {
            "email": "dup@example.com",
            "username": "dup2",
            "password": "StrongPass123",
            "re_password": "StrongPass123",
        }
        res = self.client.post(self.base_url + "users/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data)
