from drf_spectacular.openapi import AutoSchema


class CustomAutoSchema(AutoSchema):
    """Force grouping/tags by URL prefixes for third-party views like Djoser."""

    def get_tags(self):
        tags = super().get_tags()
        path = getattr(self, "path", "") or ""

        if path.startswith("/api/auth"):
            return ["Authentication"]
        if path.startswith("/api/tasks"):
            return ["Tasks"]

        return tags


def retag_endpoints(result, generator, request, public):
    """Postprocessing hook to force tags based on URL path prefixes.

    This is useful to group third-party endpoints (e.g., Djoser) under a single tag.
    """

    paths = result.get("paths", {})
    for path, operations in paths.items():
        # path example: '/api/auth/jwt/create/'
        if path.startswith("/api/auth"):
            forced_tag = ["Authentication"]
        elif path.startswith("/api/tasks"):
            forced_tag = ["Tasks"]
        else:
            forced_tag = None

        if forced_tag:
            for method, operation in operations.items():
                # methods are lowercase keys like 'get', 'post', ... and
                # parameters key is also present sometimes; ensure dict has tags
                if isinstance(operation, dict) and method.lower() in {
                    "get",
                    "post",
                    "put",
                    "patch",
                    "delete",
                    "options",
                    "head",
                }:
                    operation["tags"] = forced_tag

    return result
