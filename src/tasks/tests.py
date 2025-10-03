from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Priority, Status


class TestTaskAPI(APITestCase):
    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            email="test@example.com", username="test", password="pass1234"
        )
        self.list_url = "/api/tasks/"

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def test_auth_required(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crud_flow(self):
        self.authenticate()
        # Create
        payload = {
            "title": "Sample",
            "description": "desc",
            "priority": Priority.MEDIUM,
            "status": Status.PENDING,
        }
        res = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        task_id = res.data["id"]

        # List returns the created task
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data["count"], 1)

        # Retrieve
        detail_url = f"{self.list_url}{task_id}/"
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Update
        res = self.client.patch(detail_url, {"status": Status.COMPLETED}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], Status.COMPLETED)

        # Delete
        res = self.client.delete(detail_url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
