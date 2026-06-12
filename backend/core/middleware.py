"""
Custom middleware to ensure session-based authentication works correctly
for all HTTP methods (GET, POST, PUT, DELETE) through the Vite dev proxy.
"""


class SessionFixMiddleware:
    """
    Middleware that marks the session as modified on every API response so
    that SessionMiddleware always refreshes the session cookie in the browser.

    Placement in the MIDDLEWARE list matters: this middleware must come AFTER
    AuthenticationMiddleware (so the session is loaded and the user is set)
    but Django processes response middleware in reverse order, meaning our
    post-response code runs BEFORE SessionMiddleware's response handler.
    That lets us set ``session.modified = True`` just in time for
    SessionMiddleware to persist the cookie.

    Without this middleware, read-only GET requests don't mark the session
    as modified, so SessionMiddleware never re-sends the cookie.  If the
    browser's session cookie is lost (e.g. after a Vite proxy hiccup), the
    next non-GET request fails with "Authentication required".
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Mark session as modified for every API request so the session
        # cookie is always refreshed by SessionMiddleware.process_response.
        if request.path.startswith('/api/'):
            if hasattr(request, 'session') and getattr(request.session, 'session_key', None):
                request.session.modified = True

        return response
